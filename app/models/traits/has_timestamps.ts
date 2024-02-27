import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default function HasTimestamps(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    public static boot() {
      if (this.booted) return
      super.boot()

      column.dateTime({ autoCreate: true })(this.prototype, 'createdAt')
      column.dateTime({ autoCreate: true, autoUpdate: true })(this.prototype, 'updatedAt')
    }

    public createdAt: DateTime
    public updatedAt: DateTime
  }
}
