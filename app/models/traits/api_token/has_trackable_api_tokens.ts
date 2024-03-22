import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import { BaseModel, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import LoggedDevice from '#models/logged_device'
import HasApiTokens from '#models/traits/api_token/has_api_tokens'


export default function HasTrackableApiTokens(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class HasTrackableApiTokensModel extends compose(Superclass, HasApiTokens) {
    @hasMany(() => LoginSession)
    declare loginSessions: HasMany<typeof LoginSession>

    @manyToMany(() => LoggedDevice, {
      pivotColumns: ['ip_address', 'last_logged_at']
    })
    declare loggedDevices: ManyToMany<typeof LoggedDevice>

    async createLoginSession(loggedDevice: LoggedDevice, ipAddress: string) {
      const accessToken = await this.createToken()
      await this.related('loginSessions').create({
        accessTokenId: accessToken.identifier,
        loggedDeviceId: loggedDevice.id
      })
      await this.related('loggedDevices').sync(
        {
          [loggedDevice.id]: { 
            last_logged_at: DateTime.local(),
            ip_address: ipAddress
          },
        },
        false
      )
      return accessToken
    }
  }
  return HasTrackableApiTokensModel
}
