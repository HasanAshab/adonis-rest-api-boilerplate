import { HttpContext } from '@adonisjs/core/http'
import recaptcha2 from '@ioc:Adonis/Addons/Recaptcha2'
import { Exception } from "@adonisjs/core/exceptions";

/**
 * ReCAPTCHA middleware is meant to check recaptcha response
 * when POST/PUT requests
 *
 * You must register this middleware inside `start/kernel.ts` file under the list
 * of named middleware
 */
export default class VerifyRecaptcha {
  public async handle({ request }: HttpContext, next: () => Promise<void>): Promise<void> {
    return await next()
    try {
      await recaptcha2.validate(request.input('recaptchaResponse'))
    } catch (errors) {
      throw new Exception(
        recaptcha2.translateErrors(errors || 'invalid-input-response'),
        400,
        'E_CAPTCHA'
      )
    }
    await next()
  }
}
