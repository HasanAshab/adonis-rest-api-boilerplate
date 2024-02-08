import Validator from 'App/Http/Validators/Validator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class CreateContactValidator extends Validator {
  public schema = schema.create({
    email: schema.string([rules.email()]),
    subject: schema.string([
      rules.lengthRange(5, 72),
      // rules.sanitize()
    ]),
    message: schema.string([
      rules.lengthRange(20, 300),
      // rules.sanitize()
    ]),
  })
}
