import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default function Expirable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    public static boot() {
      if (this.booted) return
      super.boot()
      
      column.dateTime()(this.prototype, 'expiresAt')
    }

    declare expiresAt: DateTime | null = null

    public isExpired() {
      return this.expiresAt && this.expiresAt < DateTime.local()
    }

    public isNotExpired() {
      return !this.isExpired()
    }
  }
}
