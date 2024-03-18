import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import LoginActivity from '#models/login_activity'
import LoginDevice from '#models/login_device'


export default function LoginActivityTrackable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class LoginActivityTrackableModel extends Superclass {
    @hasMany(() => LoginActivity)
    declare loginActivities: HasMany<typeof LoginActivity>
    
    @manyToMany(() => LoginDevice, {
      pivotTable: 'login_activities',
      pivotColumns: ['ip'],
      pivotTimestamps: true
    }) 
    declare loginDevices: ManyToMany<typeof LoginDevice>
  }
  return LoginActivityTrackableModel
}
