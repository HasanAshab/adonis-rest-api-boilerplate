import Validator from '#app/http/validators/validator'
import { schema } from '@adonisjs/validator'
import { TwoFactorMethod } from '@ioc:adonis/addons/auth/two_factor'

export default class TwoFactorAuthMethodValidator extends Validator {
  public schema = schema.create({
    method: schema.enum(TwoFactorMethod.names())
  })
}