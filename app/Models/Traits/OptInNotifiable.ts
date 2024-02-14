import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { compose } from '@poppinss/utils/build/helpers'
import { mapValues, reduce } from 'lodash'
import { DateTime } from 'luxon'
import { BaseModel, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import { Notifiable } from '@ioc:Verful/Notification/Mixins'
import NotificationType from 'App/Models/NotificationType'
import NotificationService from 'App/Services/NotificationService'


export type NotificationPreferences = Record<string, Record<string, boolean>> 


export default function OptInNotifiable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  const TABLE_NAME = 'notifications'
  
  return class extends compose(Superclass, Notifiable(TABLE_NAME)) {
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
    
    
    //todo
    public async initNotificationPreference(notificationService = new NotificationService) {
      const ids = await NotificationType.pluck('id')
      const channelPreferences = notificationService.defaultChannelPreferences()
      
      const preferences = ids.reduce((preferences, id) => {
        preferences[id] = channelPreferences
        return preferences
      }, {})
      
      await this.syncNotificationPreference(preferences)
    }
    
    public syncNotificationPreference(preferences: NotificationPreferences) {
      const formatedPreferences = mapValues(preferences, channelPreferences => {
        const preferedChannels = reduce(channelPreferences, (preferedChannels, enabled, channel) => {
          enabled && preferedChannels.push(channel)
          return preferedChannels
        }, [])
        
        return { channels: preferedChannels }
      })
      log(formatedPreferences)

      return this.related('notificationPreferences').sync(formatedPreferences, false)
    }
  }
}