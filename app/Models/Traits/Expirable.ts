import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default function Expirable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    public static boot() {
      if (this.booted) return
      super.boot()
      
      column.dateTime()(this.prototype, 'expiresAt')
    }

    public expiresAt: DateTime | null = null

    public isExpired() {
      return this.expiresAt && this.expiresAt < DateTime.local()
    }

    public isNotExpired() {
      return !this.isExpired()
    }
  }
}
