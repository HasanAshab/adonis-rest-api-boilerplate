import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, hasMany } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider, AccessToken } from '@adonisjs/auth/access_tokens'
import LoginSession from '#models/login_session'


export default function HasApiTokens(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class HasApiTokensModel extends Superclass {
    static accessTokens = DbAccessTokensProvider.forModel(this)
    currentAccessToken?: AccessToken

    @hasMany(() => LoginSession)
    loginSessions: HasMany<typeof LoginSession>

    accessTokens() {
      return this.constructor.accessTokens.all(this)
    }
    
    createToken(name = '') {
      return this.constructor.accessTokens.create(this)
    }
  }
  return HasApiTokensModel
}
