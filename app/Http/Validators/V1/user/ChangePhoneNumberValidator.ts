import Validator from 'App/Http/Validators/Validator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class ChangePhoneNumberValidator extends Validator {
  public schema = schema.create({
    phoneNumber: schema.string([
      rules.mobile({ strict: true })
    ]),
    otp: schema.string.optional(),
  })
}
