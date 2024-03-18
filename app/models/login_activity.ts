import BaseModel from '#models/base_model'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { column, belongsTo } from '@adonisjs/lucid/orm'
import LoginDevice from '#models/login_device'


export default class LoginActivity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number  
  
  @column()
  declare userId: number

  @column()
  declare loginDeviceId: string    
  
  @column()
  declare ip: string  

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
  
  
  @belongsTo(() => LoginDevice)
  declare device: BelongsTo<typeof LoginDevice>
}