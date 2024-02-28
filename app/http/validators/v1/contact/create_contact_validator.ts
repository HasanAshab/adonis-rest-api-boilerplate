import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'
import config from '@adonisjs/core/services/config'


export default class CreateContactValidator extends Validator {
  public schema = vine.create({
    email: vine.string([ rules.email() ]),
    subject: vine.string([
      rules.lengthRange(
        config.get('app.constraints.contact.subject.minLength'),
        config.get('app.constraints.contact.subject.maxLength')
      ),
      //todo
      // rules.sanitize()
    ]),
    message: vine.string([
      rules.lengthRange(
        config.get('app.constraints.contact.message.minLength'),
        config.get('app.constraints.contact.message.maxLength')
      ),
      // rules.sanitize()
    ]),
  })
}
