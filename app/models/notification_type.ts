import BaseModel from '#models/base_model'
import { column } from '@adonisjs/lucid/orm'
import { compose } from '@poppinss/utils/build/helpers'
import HasFactory from '#models/traits/has_factory'
import HasTimestamps from '#models/traits/has_timestamps'
import NotificationService from '#services/notification_service'


export default class NotificationType extends compose(BaseModel, HasFactory, HasTimestamps) {
  @column({ isPrimary: true })
  public id: number   
  
  @column()
  public name: string 
  
  @column()
  public displayText: string
  
  @column()
  public groupName: string 
  
  @column()
  public description: string
  
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
