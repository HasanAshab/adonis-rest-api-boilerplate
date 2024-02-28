import type { HttpContext } from '@adonisjs/core/http'
import config from '@adonisjs/core/services/config'
import jwt, { JwtPayload } from 'jsonwebtoken'
import User from '#app/models/user'

export default class Authenticate {
  async handle(ctx: HttpContext, next: NextFunction) {
    const { request, response } = ctx
    const token = request.header('authorization')?.split(' ')[1]

    if (!token) {
      return response.status(401).message()
    }

    const { sub, version, iss, aud } = jwt.verify(token, config.get('app.key')) as JwtPayload
    const user = await User.findById(sub).includeHiddenFields()
    if (user && version === user.tokenVersion && iss === config.get('app.name') && aud === 'auth') {
      ctx.user = user
      return await next()
    }

    response.status(401).message()
  }
}
