import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { BaseModel, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { Notifiable } from '@ioc:Verful/Notification/Mixins'
import NotificationType from 'App/Models/NotificationType'
import { compose } from '@poppinss/utils/build/helpers'
import { mapValues, reduce } from 'lodash'
import { DateTime } from 'luxon'


export type NotificationPreferences = Record<string, Record<string, boolean>> 


export default function OptInNotifiable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  const TABLE_NAME = 'notifications'
  
  return class extends compose(Superclass, Notifiable(TABLE_NAME)) {
    public static boot() {
      if (this.booted) return
      super.boot()

      this.$addNotificationSettingsRelation()
    }

    private static $addNotificationSettingsRelation() {
      const relatedModel = () => NotificationType
      this.$addRelation('notificationSettings', 'manyToMany', relatedModel, {
        pivotTable: 'notification_preferences',
        pivotColumns: ['channels']
      })
    }
   
    public notificationPreferences: HasMany<NotificationPreference>
    
    public markNotificationAsRead(id: number) {
      return this.unreadNotifications()
        .whereUid(id)
        .updateOrFail({
          readAt: DateTime.local(),
        })
    }
  
    public syncNotificationPreference(preferences: NotificationPreferences) {
      const formatedPreference = mapValues(preferences, channelPreferences => {
        const preferedChannels = reduce(channelPreferences, (preferedChannels, enabled, channel) => {
          enabled && preferedChannels.push(channel)
          return preferedChannels
        }, [])

        return { channels: preferedChannels }
      })

      return this.related('notificationSettings').sync(formatedPreference)
    }
  }
}