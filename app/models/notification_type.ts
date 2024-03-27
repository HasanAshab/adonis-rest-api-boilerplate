import app from '@adonisjs/core/services/app'
import BaseModel from '#models/base_model'
import { column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import HasTimestamps from '#models/traits/has_timestamps'
import NotificationService from '#services/notification_service'

const notificationService = await app.container.make(NotificationService)

export default class NotificationType extends compose(BaseModel, HasTimestamps) {
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
        (channelPreference: Record<string, boolean>, channel: string) => {
          channelPreference[channel] = true
          return channelPreference
        },
        { ...defaultChannelPreferences }
      ),
    }
  }
}
