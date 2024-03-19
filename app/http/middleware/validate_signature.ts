import type { HttpContext } from '@adonisjs/core/http'

export default class ValidateSignature {
  handle({ request, response }: HttpContext, next: () => Promise<void>) {
    if (request.hasValidSignature()) {
      return next()
    }
    response.unauthorized('Invalid signature!')
  }
}
