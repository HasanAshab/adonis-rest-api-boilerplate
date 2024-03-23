import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import { BaseModel, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import LoggedDevice from '#models/logged_device'
import LoginSession from '#models/login_session'
import HasApiTokens from '#models/traits/api_token/has_api_tokens'


export default function HasTrackableApiTokens(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class HasTrackableApiTokensModel extends compose(Superclass, HasApiTokens) {
    @hasMany(() => LoginSession)
    declare loginSessions: HasMany<typeof LoginSession>

    @manyToMany(() => LoggedDevice, {
      pivotColumns: ['ip_address', 'last_logged_at'],
      pivotTimestamps: {
        updatedAt: 'last_logged_at',
      }
    })
    declare loggedDevices: ManyToMany<typeof LoggedDevice>

    async createLoginSession(accessToken: AccessToken, deviceOrId: LoggedDevice | string, ipAddress: string) {
      const deviceId = typeof deviceOrId === 'string'
        ? deviceOrId
        : deviceOrId.id 
      await this.related('loggedDevices').sync(
        {
          [deviceId]: { 
            ip_address: ipAddress
          },
        },
        false
      )
      return await this.related('loginSessions').create({
        accessTokenId: accessToken.identifier,
        loggedDeviceId: deviceId
      })
    }
    
    async createTrackableToken(deviceOrId: LoggedDevice | string, ipAddress: string) {
      const accessToken = await this.createToken()
      await this.createLoginSession(accessToken, deviceOrId, ipAddress)
      return accessToken
    }
  }
  return HasTrackableApiTokensModel
}
