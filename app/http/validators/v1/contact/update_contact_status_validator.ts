import Validator from '#app/http/validators/validator'
import { schema } from '@adonisjs/validator'

export default class UpdateContactStatusValidator extends Validator {
  public schema = vine.create({
    status: vine.enum(['opened', 'closed']),
  })
}
