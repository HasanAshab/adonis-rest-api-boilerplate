import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'
import Config from '@ioc:adonis/core/config'


export default class ChangePasswordValidator extends Validator {
  public schema = schema.create({
    oldPassword: schema.string(),
    password: schema.string([ 
      rules.password(),
      rules.maxLength(Config.get('app.constraints.user.password.maxLength'))
    ])
  })
}
