import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { BaseModel } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export default function HasApiTokens(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class HasApiTokensModel extends Superclass {
    public static accessTokens = DbAccessTokensProvider.forModel(this)
    public currentAccessToken?: string
    public createToken(name = '') {
      return this.constructor.accessTokens.create(this)
    }
  }
  return HasApiTokensModel
}
