import Config from '@ioc:Adonis/Core/Config'
import axios from "axios";

export default class VerifyRecaptcha {
  async handle({ request, response }: HttpContextContract, next: NextFunction) {
    const body = {
      secret: Config.get("recaptcha.secretKey"),
      response: request.input('recaptchaResponse')
    }
    
    const { data } = await axios.post('https://www.google.com/recaptcha/api/siteverify', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (data.success) {
      return await next();
    }
    res.status(400).message('reCAPTCHA verification failed!')
  }
}