import { HttpContext } from '@adonisjs/core/http'
import recaptcha from '#ioc/recaptcha'

export default class VerifyRecaptcha {
  async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    //await recaptcha.validate(request.input('recaptchaResponse'))
    await next()
  }
}
