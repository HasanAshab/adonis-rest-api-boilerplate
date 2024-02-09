import Validator from 'App/Http/Validators/Validator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Config from '@ioc:Adonis/Core/Config'


export default class CreateContactValidator extends Validator {
  public schema = schema.create({
    email: schema.string([ rules.email() ]),
    subject: schema.string([
      rules.lengthRange(
        Config.get('app.constraints.contact.subject.minLength'),
        Config.get('app.constraints.contact.subject.maxLength')
      ),
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
