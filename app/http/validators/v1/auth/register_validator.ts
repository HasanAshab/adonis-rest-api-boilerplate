import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'
import config from '@adonisjs/core/services/config'


export default class RegisterValidator extends Validator {
  public schema = vine.create({
    email: vine.string([
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
      }),
    ]),

    username: vine.string([
      rules.alphaNum(),
      rules.lengthRange(
        config.get('app.constraints.user.username.minLength'),
        config.get('app.constraints.user.username.maxLength')
      ),
      rules.unique({
        table: 'users',
        column: 'username',
      }),
    ]),

    password: vine.string([ 
      rules.password(),
      rules.maxLength(config.get('app.constraints.user.password.maxLength'))
    ]),

    avatar: vine.file.optional(
      config.get('app.constraints.user.avatar')
    )
  })
}
