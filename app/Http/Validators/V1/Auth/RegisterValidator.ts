import Validator from "App/Http/Validators/Validator";
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class RegisterValidator extends Validator {
  public schema = schema.create({
    email: schema.string([
      rules.email(),
      rules.unique('User', 'email')
    ]),
    username: schema.string([
      rules.alphaNum(),
      rules.unique('User', 'username')
    ]),
    password: schema.string([
      rules.password("strong")
    ]),
  });
}
