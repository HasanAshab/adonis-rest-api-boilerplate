import Validator from 'App/Http/Validators/Validator'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class UpdateContactStatusValidator extends Validator {
  public schema = schema.create({
    status: schema.enum(['opened', 'closed']),
  })
}
