import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default function HasTimestamps(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class HasTimestampsModel extends Superclass {
    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime
    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime
  }
  return HasTimestampsModel
}
