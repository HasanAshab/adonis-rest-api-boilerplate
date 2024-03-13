import { HttpContext } from '@adonisjs/core/http'
import recaptcha from '#ioc/recaptcha'
import ApiException from "#exceptions/api_exception";

export default class VerifyRecaptcha {
  public async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    try {
     // await recaptcha.validate(request.input('recaptchaResponse'))
      await next()
    }
    catch (errors) {
      const message = recaptcha.translateErrors(errors || 'invalid-input-response')[0]
      throw new ApiException(message, {
        code: 'E_RE_CAPTCHTA_EXCEPTION',
        status: 403
      })
    }
  }
}
