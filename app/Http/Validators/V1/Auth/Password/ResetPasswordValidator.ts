import Validator from 'App/Http/Validators/Validator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Config from '@ioc:Adonis/Core/Config'

export default class ResetPasswordValidator extends Validator {
  public schema = schema.create({
    token: schema.string(),
    password: schema.string([ 
      rules.password(),
      rules.maxLength(Config.get('app.constraints.user.password.maxLength'))
    ]),
  })
}
