import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import HttpContext from '@ioc:Adonis/Core/HttpContext'
import AuthManager from '@ioc:Adonis/Addons/Auth'

export default function HasApiTokens(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    public async createToken(name = '') {
      const ctx = HttpContext.create('/', {})
      const auth = await AuthManager.getAuthForRequest(ctx)
      const config = auth.use().config.tokenProvider

      return await auth.login(this, {
        name,
        expiresIn: config.expiresIn,
      })
    }
  }
}
