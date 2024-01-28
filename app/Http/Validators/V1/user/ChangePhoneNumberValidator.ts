import Validator from 'App/Http/Validators/Validator';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class ChangePhoneNumberValidator extends Validator {
  public schema = schema.create({
    phoneNumber: schema.string(),
    otp: schema.string()
  })
}