import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class LoginDevice extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare type: string
  
  @column()
  declare vendor: string
  
  @column()
  declare model: string 
  
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}