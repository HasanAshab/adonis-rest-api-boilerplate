import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default function Expirable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class ExpirableModel extends Superclass {
    @column.dateTime()
    public expiresAt: DateTime | null = null

    public isExpired() {
      return this.expiresAt && this.expiresAt < DateTime.local()
    }

    public isNotExpired() {
      return !this.isExpired()
    }
  }
  
  return ExpirableModel
}
