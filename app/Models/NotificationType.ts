import BaseModel from 'App/Models/BaseModel'
import { column } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@poppinss/utils/build/helpers'
import HasFactory from 'App/Models/Traits/HasFactory'
import NotificationService from 'App/Services/NotificationService'


export default class NotificationType extends compose(BaseModel, HasFactory) {
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
