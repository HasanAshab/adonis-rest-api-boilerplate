import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import LoggedDevice from '#models/logged_device'

export default function LoginActivityTrackable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class LoginActivityTrackableModel extends Superclass {
    @manyToMany(() => LoggedDevice, {
      pivotColumns: ['ip_address', 'last_logged_at']
    })
    declare loggedDevices: ManyToMany<typeof LoggedDevice>
  }
  return LoginActivityTrackableModel
}
