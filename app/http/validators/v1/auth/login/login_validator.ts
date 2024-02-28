import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'

export default class LoginValidator extends Validator {
  public schema = vine.create({
    email: vine.string([ rules.email() ]),
    password: vine.string(),
    otp: vine.string.optional(),
  })
}
