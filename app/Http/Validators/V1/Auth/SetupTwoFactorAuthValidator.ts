import Validator from 'App/Http/Validators/Validator'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class SetupTwoFactorAuthValidator extends Validator {
  public schema = schema.create({
    enable: schema.boolean.optional(),
    method: schema.enum.optional(['sms', 'call', 'app'] as const),
  })
}
