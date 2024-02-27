import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'

export default class ChangePhoneNumberValidator extends Validator {
  public schema = schema.create({
    phoneNumber: schema.string([
      rules.mobile({ strict: true }) 
    ]),
    otp: schema.string.optional(),
  })
}
