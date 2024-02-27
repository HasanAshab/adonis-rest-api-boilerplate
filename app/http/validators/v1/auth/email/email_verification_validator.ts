import Validator from '#app/Http/Validators/Validator'
import { schema } from '@adonisjs/validator'
import Config from '@ioc:Adonis/Core/Config'

export default class EmailVerificationValidator extends Validator {
  public schema = schema.create({
    id: schema.number(),
    token: schema.string()
  })
}
