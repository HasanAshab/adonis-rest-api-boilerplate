import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { BaseModel } from '@adonisjs/lucid/orm'
import HttpContext from '@adonisjs/core/http'
import AuthManager from '@ioc:Adonis/Addons/Auth'

export default function HasApiTokens(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    public async createToken(name = '', meta: object) {
      const ctx = HttpContext.create('/', {})
      const auth = await AuthManager.getAuthForRequest(ctx)
      const config = auth.use().config.tokenProvider

      return await auth.login(this, {
        name,
        expiresIn: config.expiresIn,
        ...meta
      })
    }
  }
}
