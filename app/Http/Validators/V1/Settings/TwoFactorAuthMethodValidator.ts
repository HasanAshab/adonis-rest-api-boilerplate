import Validator from 'App/Http/Validators/Validator'
import { schema } from '@ioc:Adonis/Core/Validator'
import { TwoFactorMethod } from '@ioc:Adonis/Addons/Auth/TwoFactor'

export default class TwoFactorAuthMethodValidator extends Validator {
  public schema = schema.create({
    method: schema.enum(TwoFactorMethod.names())
  })
}