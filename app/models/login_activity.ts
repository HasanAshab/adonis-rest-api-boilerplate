import BaseModel from '#models/base_model'
import { DateTime } from 'luxon'
import { column } from '@adonisjs/lucid/orm'

export default class LoginActivity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number  
  
  @column()
  declare userId: number

  @column()
  declare accessTokenId: number
  
  @column()
  declare deviceId: string    
  
  @column()
  declare ip: string  

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}