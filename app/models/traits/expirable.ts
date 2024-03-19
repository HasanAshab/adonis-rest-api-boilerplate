import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default function Expirable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class ExpirableModel extends Superclass {
    @column.dateTime()
    expiresAt: DateTime | null = null

    isExpired() {
      return this.expiresAt && this.expiresAt < DateTime.local()
    }

    isNotExpired() {
      return !this.isExpired()
    }
  }

  return ExpirableModel
}
