import Validator from '#app/Http/Validators/Validator'
import { schema } from '@adonisjs/validator'

export default class UpdateContactStatusValidator extends Validator {
  public schema = schema.create({
    status: schema.enum(['opened', 'closed']),
  })
}
