import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class OtpRequiredException extends Exception {
  status = 200;
  message = "Credentials matched, otp required.";
  
  handle(error: this, { response }: HttpContextContract) {
    response.status(error.status).api({
      message: error.message,
      twoFactorAuthRequired: true
    });
  }
}