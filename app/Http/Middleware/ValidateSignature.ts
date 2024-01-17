import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ValidateSignature {
  public handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    if(request.hasValidSignature()) {
      return next();
    }
    response.unauthorized("Invalid signature!");
  }
}
