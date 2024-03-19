import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import LoginDevice from '#models/login_device'

export default function LoginActivityTrackable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class LoginActivityTrackableModel extends Superclass {
    @manyToMany(() => LoginDevice, {
      pivotColumns: ['ip'],
      pivotTimestamps: true,
    })
    declare loginDevices: ManyToMany<typeof LoginDevice>
  }
  return LoginActivityTrackableModel
}
