import Validator from '#app/Http/Validators/Validator'
import { schema, rules } from '@adonisjs/validator'
import Config from '@ioc:Adonis/Core/Config'


export default class UpdateProfileValidator extends Validator {
  public schema = schema.create({
    name: schema.string.optional([
      rules.lengthRange(
        Config.get('app.constraints.user.name.minLength'),
        Config.get('app.constraints.user.name.maxLength')
      ), 
   // rules.sanitize()
    ]),
    username: schema.string.optional([
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
    email: schema.string.optional([
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
      })
    ]),
    avatar: schema.file.optional(
      Config.get('app.constraints.user.avatar')
    )
  })
}
