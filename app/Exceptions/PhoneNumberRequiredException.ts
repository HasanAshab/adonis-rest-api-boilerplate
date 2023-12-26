import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PhoneNumberRequiredException extends Exception {
  status = 422;
  message = "Phone number is required.";
  
  handle(error: this, { response }: HttpContextContract) {
    response.status(error.status).api({
      message: error.message,
      phoneNumberRequired: true
    });
  }
}