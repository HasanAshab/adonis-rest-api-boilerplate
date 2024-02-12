import BaseModel from 'App/Models/BaseModel'
import { column } from '@ioc:Adonis/Lucid/Orm'

export default class NotificationPreference extends BaseModel {
  @column({ isPrimary: true })
  public id: number
 
  @column()
  public userId: number
  
  @column()
  public notificationTypeId: number
}
