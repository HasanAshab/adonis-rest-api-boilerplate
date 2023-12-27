import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class OtpRequiredException extends Exception {
  status = 401;
  message = "Credentials matched, otp required.";
  headers = {
    'X-2FA-CODE': 'required'
  }
}