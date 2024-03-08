import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { BaseModel } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export default function HasApiTokens(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    public static accessTokens = DbAccessTokensProvider.forModel(this.constructor)
    
    public createToken(name = '', meta: object) {
      return this.constructor.accessTokens.create(this)
    }
  }
}
