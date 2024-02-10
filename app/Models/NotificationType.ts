import BaseModel from 'App/Models/BaseModel'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class NotificationType extends BaseModel {
  @column({ isPrimary: true })
  public id: number 
  
  @column()
  public type: string 
  
  @column()
  public name: string
 
  @column()
  public description: string
}
