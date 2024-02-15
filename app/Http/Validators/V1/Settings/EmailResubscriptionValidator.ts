import Validator from 'App/Http/Validators/Validator'
import { schema } from '@ioc:Adonis/Core/Validator'


export default class EmailResubscriptionValidator extends Validator {
  public schema = schema.create({
    id: schema.number(),
    token: schema.string(),
    notificationType: schema.string()
  })
}