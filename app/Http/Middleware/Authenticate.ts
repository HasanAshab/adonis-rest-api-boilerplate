import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Config from '@ioc:Adonis/Core/Config'
import jwt, { JwtPayload } from 'jsonwebtoken'
import User from 'App/Models/User'

export default class Authenticate {
  async handle(ctx: HttpContextContract, next: NextFunction) {
    const { request, response } = ctx
    const token = request.header('authorization')?.split(' ')[1]

    if (!token) {
      return response.status(401).message()
    }

    const { sub, version, iss, aud } = jwt.verify(token, Config.get('app.key')) as JwtPayload
    const user = await User.findById(sub).includeHiddenFields()
    if (user && version === user.tokenVersion && iss === Config.get('app.name') && aud === 'auth') {
      ctx.user = user
      return await next()
    }

    response.status(401).message()
  }
}
