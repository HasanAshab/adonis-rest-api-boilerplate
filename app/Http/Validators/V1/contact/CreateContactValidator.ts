import Validator from '#app/Http/Validators/Validator'
import { schema, rules } from '@adonisjs/validator'
import Config from '@ioc:Adonis/Core/Config'


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
