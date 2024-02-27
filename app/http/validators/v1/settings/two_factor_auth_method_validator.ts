import Validator from '#app/Http/Validators/Validator'
import { schema } from '@adonisjs/validator'
import { TwoFactorMethod } from '@ioc:Adonis/Addons/Auth/TwoFactor'

export default class TwoFactorAuthMethodValidator extends Validator {
  public schema = schema.create({
    method: schema.enum(TwoFactorMethod.names())
  })
}