import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'
import config from '@adonisjs/core/services/config'

export default class ResetPasswordValidator extends Validator {
  public schema = vine.create({
    id: vine.number(),
    token: vine.string(),
    password: vine.string([ 
      rules.password(),
      rules.maxLength(config.get('app.constraints.user.password.maxLength'))
    ]),
  })
}
