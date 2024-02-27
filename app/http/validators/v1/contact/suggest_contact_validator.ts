import Validator from '#app/http/validators/validator'
import { schema } from '@adonisjs/validator'

export default class SuggestContactValidator extends Validator {
  public schema = schema.create({
    q: schema.string(),
    status: schema.enum.optional(['opened', 'closed']),
    limit: schema.number.optional(),
  })
}
