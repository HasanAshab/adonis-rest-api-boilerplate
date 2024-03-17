import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class LoginSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number  
  
  @column()
  declare accessTokenId: number
  
  @column()
  declare deviceId: string    
  
  @column()
  declare ip: string  

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}