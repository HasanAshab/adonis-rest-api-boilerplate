import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import { compose } from '@adonisjs/core/helpers'
import { mapValues, reduce } from 'lodash-es'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { BaseModel } from '@adonisjs/lucid/orm'
import { Notifiable } from '@ioc:verful/notification/mixins'
import NotificationType from '#models/notification_type'
import NotificationService from '#services/notification_service'
import { ManyToMany } from '@adonisjs/lucid/types/relations'

export type NotificationPreferences = Record<string, string[] | Record<string, boolean>>

export default function OptInNotifiable(
  Superclass: NormalizeConstructor<typeof BaseModel>,
  tableName = 'notifications'
) {
  return class extends compose(Superclass, Notifiable(tableName)) {
    static boot() {
      if (this.booted) return
      super.boot()

      this.$addNotificationPreferencesRelation()
    }

    private static $addNotificationPreferencesRelation() {
      const relatedModel = () => NotificationType
      this.$addRelation('notificationPreferences', 'manyToMany', relatedModel, {
        pivotTable: 'notification_preferences',
        pivotColumns: ['channels'],
      })
    }

    declare notificationPreference: ManyToMany<NotificationType>

    unreadNotifications() {
      return this.related('notifications').query().whereNull('readAt')
    }

    markNotificationAsRead(id: number) {
      return this.unreadNotifications().whereUid(id).updateOrFail({
        readAt: DateTime.local(),
      })
    }

    async notificationPreferenceFor(notificationType: string) {
      const preference = await this.related('notificationPreferences')
        .query()
        .where('name', notificationType)
        .select('pivot_channels')
        .pojo()
        .first()

      if (!preference) {
        throw new Error(`Notification type "${notificationType}" not exists`)
      }

      return preference.pivot_channels
    }

    async initNotificationPreference() {
      const ids = await NotificationType.pluck('id')
      const channels = NotificationService.channels()
      const preferences = ids.reduce((acc, id) => {
        acc[id] = channels
        return acc
      }, {})
      await this.syncNotificationPreference(preferences)
    }

    syncNotificationPreference(preferences: NotificationPreferences, detach = false) {
      const formatedPreferences = mapValues(preferences, (channelPreferences) => {
        if (!Array.isArray(channelPreferences)) {
          channelPreferences = reduce(
            channelPreferences,
            (preferedChannels, enabled, channel) => {
              enabled && preferedChannels.push(channel)
              return preferedChannels
            },
            []
          )
        }
        return { channels: channelPreferences }
      })

      return this.related('notificationPreferences').sync(formatedPreferences, detach)
    }

    async enableNotification(id: number, channel: string) {
      await this.related('notificationPreferences')
        .pivotQuery()
        .whereUid(id)
        .updateOrFail({
          channels: db.raw(`ARRAY_APPEND(channels, '${channel}')`),
        })
    }

    async disableNotification(id: number, channel: string) {
      await this.related('notificationPreferences')
        .pivotQuery()
        .whereUid(id)
        .updateOrFail({
          channels: db.raw(`ARRAY_REMOVE(channels, '${channel}')`),
        })
    }
  }
}
