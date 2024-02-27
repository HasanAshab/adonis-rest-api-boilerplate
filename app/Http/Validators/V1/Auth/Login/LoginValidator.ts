import Validator from '#app/Http/Validators/Validator'
import { schema, rules } from '@adonisjs/validator'

export default class LoginValidator extends Validator {
  public schema = schema.create({
    email: schema.string([ rules.email() ]),
    password: schema.string(),
    otp: schema.string.optional(),
  })
}
