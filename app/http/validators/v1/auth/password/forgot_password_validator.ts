import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'

export default class ForgotPasswordValidator extends Validator {
  public schema = schema.create({
    email: schema.string([ rules.email() ]),
  })
}
