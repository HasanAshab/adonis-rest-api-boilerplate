import BaseModel from '#models/base_model'
import { column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import HasFactory from '#models/traits/has_factory/mixin'
import HasTimestamps from '#models/traits/has_timestamps'
import NotificationService from '#services/notification_service'


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
  
  //todo
  public serializeExtras(notificationService = new NotificationService) {
    const defaultChannelPreferences = notificationService.defaultChannelPreferences(false)
    return {
      channels: this.$extras.pivot_channels.reduce((channelPreference, channel) => {
        channelPreference[channel] = true
        return channelPreference
      }, {...defaultChannelPreferences})
    }
  }
}
