import Validator from 'App/Http/Validators/Validator'
import { schema } from '@ioc:Adonis/Core/Validator'
import Config from '@ioc:Adonis/Core/Config'

export default class EmailVerificationValidator extends Validator {
  public schema = schema.create({
    id: schema.number(),
    token: schema.string()
  })
}
