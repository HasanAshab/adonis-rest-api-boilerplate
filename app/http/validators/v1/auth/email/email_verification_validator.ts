import Validator from '#app/http/validators/validator'
import { schema } from '@adonisjs/validator'
import config from '@adonisjs/core/services/config'

export default class EmailVerificationValidator extends Validator {
  public schema = vine.create({
    id: vine.number(),
    token: vine.string()
  })
}
