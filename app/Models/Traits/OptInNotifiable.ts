import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { compose } from '@poppinss/utils/build/helpers'
import { mapValues, reduce } from 'lodash'
import { DateTime } from 'luxon'
import DB from '@ioc:Adonis/Lucid/Database'
import { BaseModel, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import { Notifiable } from '@ioc:Verful/Notification/Mixins'
import NotificationType from 'App/Models/NotificationType'
import NotificationService from 'App/Services/NotificationService'


export type NotificationPreferences = Record<string, string[] | Record<string, boolean>> 


export default function OptInNotifiable(Superclass: NormalizeConstructor<typeof BaseModel>, tableName = 'notifications') {
  return class extends compose(Superclass, Notifiable(tableName)) {
    public static boot() {
      if (this.booted) return
      super.boot()

      this.$addNotificationPreferencesRelation()
    }

    private static $addNotificationPreferencesRelation() {
      const relatedModel = () => NotificationType
      this.$addRelation('notificationPreferences', 'manyToMany', relatedModel, {
        pivotTable: 'notification_preferences',
        pivotColumns: ['channels']
      })
    }
   
    public notificationPreference: ManyToMany<NotificationType>
    
    public markNotificationAsRead(id: number) {
      return this.unreadNotifications()
        .whereUid(id)
        .updateOrFail({
          readAt: DateTime.local(),
        })
    }
    
    public async notificationPreferenceFor(notificationType: string) {
      const preference = await this.related('notificationPreferences')
        .query()
        .where('name', notificationType)
        .select('pivot_channels') // Todo check
        .pojo()
        .first()
      
      if(!preference) {
        throw new Error(`Notification type "${notificationType}" not exists`)
      }
      
      return preference.pivot_channels 
    }

    //todo
    public async initNotificationPreference(notificationService = new NotificationService) {
      const ids = await NotificationType.pluck('id')
      const channels = notificationService.channels()
      const preferences = ids.reduce((acc, id) => {
        acc[id] = channels;
        return acc;
      }, {});
      await this.syncNotificationPreference(preferences)
    }
    
    public syncNotificationPreference(preferences: NotificationPreferences, detach = false) {
      const formatedPreferences = mapValues(preferences, channelPreferences => {
       if(!Array.isArray(channelPreferences)) {
          channelPreferences = reduce(channelPreferences, (preferedChannels, enabled, channel) => {
            enabled && preferedChannels.push(channel)
            return preferedChannels
          }, [])
       }
        return { channels: channelPreferences }
      })

      return this.related('notificationPreferences').sync(formatedPreferences, detach)
    }

    public async enableNotification(id: string, channel: string) {
      await this.related('notificationPreferences')
        .pivotQuery()
        .whereUid(id)
        .updateOrFail({ 
          channels: DB.raw(`ARRAY_APPEND(channels, '${channel}')`)
        })
    }
    
    public async disableNotification(id: string, channel: string) {
      await this.related('notificationPreferences')
        .pivotQuery()
        .whereUid(id)
        .updateOrFail({ 
          channels: DB.raw(`ARRAY_REMOVE(channels, '${channel}')`)
        })
    }
  }
}