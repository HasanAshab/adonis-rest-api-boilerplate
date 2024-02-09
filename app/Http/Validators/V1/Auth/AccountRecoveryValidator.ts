import Validator from 'App/Http/Validators/Validator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class AccountRecoveryValidator extends Validator {
  public schema = schema.create({
    email: schema.string([ rules.email() ]),
    code: schema.string(),
  })
}
