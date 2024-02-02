import Validator from 'App/Http/Validators/Validator'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class LoginValidator extends Validator {
  public schema = schema.create({
    email: schema.string(),
    password: schema.string(),
    otp: schema.string.optional(),
  })
}
