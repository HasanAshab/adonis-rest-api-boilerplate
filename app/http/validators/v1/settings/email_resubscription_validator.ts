import Validator from '#app/http/validators/validator'
import { schema } from '@adonisjs/validator'


export default class EmailResubscriptionValidator extends Validator {
  public schema = schema.create({
    id: schema.number(),
    token: schema.string(),
    notificationType: schema.string()
  })
}