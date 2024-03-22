import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import { BaseModel } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider, AccessToken } from '@adonisjs/auth/access_tokens'


export default function HasApiTokens(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class HasApiTokensModel extends Superclass {
    static accessTokens = DbAccessTokensProvider.forModel(this)
    currentAccessToken?: AccessToken

    accessTokens() {
      return this.constructor.accessTokens.all(this)
    }
    
    createToken(name = '') {
      return this.constructor.accessTokens.create(this)
    }
  }
  return HasApiTokensModel
}
