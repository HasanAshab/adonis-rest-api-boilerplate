import Validator from '#app/http/validators/validator'
import { schema } from '@adonisjs/validator'
import Config from '@ioc:adonis/core/config'

export default class EmailVerificationValidator extends Validator {
  public schema = schema.create({
    id: schema.number(),
    token: schema.string()
  })
}
