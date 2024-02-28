import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'

export default class SocialAuthTokenLoginValidator extends Validator {
  public schema = vine.create({
    token: vine.string(),

    email: vine.string.optional([rules.email(), rules.maxLength(254)]),

    username: vine.string.optional([rules.alphaNum(), rules.lengthRange(3, 20)]),
  })
}
