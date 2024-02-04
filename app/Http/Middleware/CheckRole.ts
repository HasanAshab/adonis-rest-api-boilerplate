import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CheckRole {
  handle({ response, auth: { user } }: HttpContextContract, next: NextFunction, roles: string[]) {
    if (!user) {
      throw new Error('You have to use "auth" middleware before using "role" middleware.')
    }

    if (roles.includes(user.role)) {
      return next()
    }

    response.forbidden()
  }
}
