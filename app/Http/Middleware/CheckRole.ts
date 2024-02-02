import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CheckRole {
  handle({ response, auth }: HttpContextContract, next: NextFunction, roles: string[]) {
    if (!auth.user) {
      throw new Error('You have to use "auth" middleware before using "role" middleware.')
    }

    if (roles.includes(auth.user.role)) {
      return next()
    }

    response.forbidden()
  }
}
