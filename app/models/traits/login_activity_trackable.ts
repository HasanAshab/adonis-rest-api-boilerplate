import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import LoginActivity from '#models/login_activity'

export default function LoginActivityTrackable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class LoginActivityTrackableModel extends Superclass {
    @hasMany(() => LoginActivity)
    declare loginActivities: HasMany<typeof LoginActivity>
  }
  return LoginActivityTrackableModel
}
