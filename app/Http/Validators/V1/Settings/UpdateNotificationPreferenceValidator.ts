import Validator from 'App/Http/Validators/Validator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Config from '@ioc:Adonis/Core/Config'



export default class UpdateNotificationPreferenceValidator extends Validator {
  public schema() {
    return schema.create({
    a: schema.string()
  })
  }
}
