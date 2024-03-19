import type { HttpContext } from '@adonisjs/core/http'
import EmailVerificationRequiredException from '#exceptions/email_verification_required_exception'


export default class EnsureEmailIsVerified {
  handle({ response, auth: { user } }: HttpContext, next: NextFunction) {
    if (!user) {
      throw new Error('You have to use "auth" middleware before using "verified" middleware.')
    }

    if (user.verified) {
      return next()
    }
    throw new EmailVerificationRequiredException()
  }
}
