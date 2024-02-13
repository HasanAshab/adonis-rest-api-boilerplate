import BaseModel from 'App/Models/BaseModel'
import type NotificationConfig from 'Config/notification'
import { column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import NotificationType from 'App/Models/NotificationType'

export default class NotificationPreference extends BaseModel {
  @column({ isPrimary: true })
  public id: number
 
  @column()
  public userId: number
  
  @column()
  public notificationTypeId: number 
  
  @column()
  public channels: (keyof NotificationConfig['channels'])[]
  
  @belongsTo(() => NotificationType)
  public notificationType: BelongsTo<NotificationType>
}
