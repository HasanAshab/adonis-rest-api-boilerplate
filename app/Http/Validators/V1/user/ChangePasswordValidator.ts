import Validator from 'App/Http/Validators/Validator';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class ChangePasswordValidator extends Validator {
  public schema = schema.create({
    oldPassword: schema.string(),
    newPassword: schema.string([
      rules.password()
    ])
  })
}