import BaseModel from '#models/base_model'
import { DateTime } from 'luxon'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'


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
  
  public serializeExtras() {
    return {
      ip: this.$extras.pivot_ip
    }
  }

  public static markAsTrusted(id: string) {
    return this.updateOrFail(id, { isTrusted: true })
  }
}