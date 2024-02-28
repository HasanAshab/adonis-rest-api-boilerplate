import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'

export default class TwoFactorAccountRecoveryValidator extends Validator {
  public schema = vine.create({
    email: vine.string([ rules.email() ]),
    code: vine.string(),
  })
}
