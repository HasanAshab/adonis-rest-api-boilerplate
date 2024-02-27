import Validator from '#app/Http/Validators/Validator'
import { schema, rules } from '@adonisjs/validator'
import Config from '@ioc:Adonis/Core/Config'


export default class ChangePasswordValidator extends Validator {
  public schema = schema.create({
    oldPassword: schema.string(),
    password: schema.string([ 
      rules.password(),
      rules.maxLength(Config.get('app.constraints.user.password.maxLength'))
    ])
  })
}
