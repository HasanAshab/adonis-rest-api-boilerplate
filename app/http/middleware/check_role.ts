import type { HttpContext } from '@adonisjs/core/http'

export default class CheckRole {
  handle({ response, auth: { user } }: HttpContext, next: NextFunction, roles: string[]) {
    if (!user) {
      throw new Error('You have to use "auth" middleware before using "role" middleware.')
    }

    if (roles.includes(user.role)) {
      return next()
    }

    response.forbidden()
  }
}
