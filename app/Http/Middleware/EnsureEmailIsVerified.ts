import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'


export default class EnsureEmailIsVerified {
  handle({ response, auth: { user } }: HttpContextContract, next: NextFunction) {
    if (!user) {
      throw new Error('You have to use "auth" middleware before using "verified" middleware.')
    }

    if (user.verified) {
      return next()
    }

    response.forbidden('Your have to verify your email to perfom this action!')
  }
}
