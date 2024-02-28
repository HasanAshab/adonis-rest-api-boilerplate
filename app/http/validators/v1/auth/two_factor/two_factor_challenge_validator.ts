import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'

export default class TwoFactorChallengeValidator extends Validator {
  public schema = vine.create({
    email: vine.string([ rules.email() ]),
    token: vine.string()
  })
}