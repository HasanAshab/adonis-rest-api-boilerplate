import app from '@adonisjs/core/services/app'
import ReCaptcha2 from 'recaptcha2'
import InvalidReCaptchaException from '#exceptions/invalid_re_captcha_exception'

export default class Recaptcha extends ReCaptcha2 {
  async validate(recaptchaResponse: string) {
    try {
      await super.validate(recaptchaResponse)
    } catch (errors) {
      const message = this.translateErrors(errors || 'invalid-input-response')[0]
      throw new InvalidReCaptchaException(message)
    }
  }
}