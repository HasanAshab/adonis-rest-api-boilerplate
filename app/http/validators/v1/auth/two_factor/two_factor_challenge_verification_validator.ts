import Validator from '#app/http/validators/validator'
import { schema, rules } from '@adonisjs/validator'

export default class TwoFactorChallengeVerificationValidator extends Validator {
  public schema = vine.create({
    email: vine.string([ rules.email() ]),
    token: vine.string(),
    challengeToken: vine.string()
  })
}