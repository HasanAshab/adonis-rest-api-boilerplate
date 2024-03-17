import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class LoginDevice extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare type: string
  
  @column()
  declare vendor: string | null = null
  
  @column()
  declare model: string
  
  @column()
  public isTrusted = false 
  
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
  
  public markAsTrusted(id: string) {
    return this.query().updateOrFail(deviceId, { isTrusted: true })
  }
}