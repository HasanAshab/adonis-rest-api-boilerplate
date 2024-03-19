import app from '@adonisjs/core/services/app'
import BaseModel from '#models/base_model'
import { column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import HasFactory from '#models/traits/has_factory/mixin'
import HasTimestamps from '#models/traits/has_timestamps'
import NotificationService from '#services/notification_service'

const notificationService = await app.container.make(NotificationService)

export default class NotificationType extends compose(BaseModel, HasFactory, HasTimestamps) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare displayText: string

  @column()
  declare groupName: string

  @column()
  declare description: string

  serializeExtras() {
    const defaultChannelPreferences = notificationService.defaultChannelPreferences(false)
    return {
      channels: this.$extras.pivot_channels.reduce(
        (channelPreference, channel) => {
          channelPreference[channel] = true
          return channelPreference
        },
        { ...defaultChannelPreferences }
      ),
    }
  }
}
