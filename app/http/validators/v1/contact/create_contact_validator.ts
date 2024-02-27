import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'
import Config from '@ioc:adonis/core/config'


export default class CreateContactValidator extends Validator {
  public schema = schema.create({
    email: schema.string([ rules.email() ]),
    subject: schema.string([
      rules.lengthRange(
        Config.get('app.constraints.contact.subject.minLength'),
        Config.get('app.constraints.contact.subject.maxLength')
      ),
      //todo
      // rules.sanitize()
    ]),
    message: schema.string([
      rules.lengthRange(
        Config.get('app.constraints.contact.message.minLength'),
        Config.get('app.constraints.contact.message.maxLength')
      ),
      // rules.sanitize()
    ]),
  })
}
