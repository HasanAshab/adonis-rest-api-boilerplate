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
      rules.minLength(3),
      rules.unique('User', 'username')
    ]),
    
    password: schema.string([
      rules.password("standard")
    ]),
    
    profile: schema.file.optional({
      size: '1mb',
      extnames: ['jpg', 'png']
    })
  });
}
