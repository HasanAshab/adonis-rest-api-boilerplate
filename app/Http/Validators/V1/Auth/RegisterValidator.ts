import Validator from 'App/Http/Validators/Validator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Config from '@ioc:Adonis/Core/Config'


export default class RegisterValidator extends Validator {
  public schema = schema.create({
    email: schema.string([
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
      }),
    ]),

    username: schema.string([
      rules.alphaNum(),
      rules.lengthRange(
        Config.get('app.constraints.user.username.minLength'),
        Config.get('app.constraints.user.username.maxLength')
      ),
      rules.unique({
        table: 'users',
        column: 'username',
      }),
    ]),

    password: schema.string([ 
      rules.password(),
      rules.maxLength(Config.get('app.constraints.user.password.maxLength'))
    ]),

    avatar: schema.file.optional(
      Config.get('app.constraints.user.avatar')
    )
  })
}
