import Validator from '#app/http/validators/validator'
import { schema } from '@adonisjs/validator'

export default class SuggestContactValidator extends Validator {
  public schema = vine.create({
    q: vine.string(),
    status: vine.enum.optional(['opened', 'closed']),
    limit: vine.number.optional(),
  })
}
