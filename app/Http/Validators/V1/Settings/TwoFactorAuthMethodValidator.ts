import Validator from 'App/Http/Validators/Validator'
import { schema } from '@ioc:Adonis/Core/Validator'


export default class TwoFactorAuthMethodValidator extends Validator {
  public schema = schema.create({
    method: schema.enum(['app', 'sms', 'call'])
  })
}