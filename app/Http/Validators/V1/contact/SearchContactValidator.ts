     import Validator from 'App/Http/Validators/Validator'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class SearchContactValidator extends Validator {
  public schema = schema.create({
    q: Validator.string(),
    status: schema.enum.optional(['opened', 'closed'])
    //cursor: Validator.string()
  })
}