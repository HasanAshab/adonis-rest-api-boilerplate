import ApiException from '#exceptions/api_exception'
import type User from '#models/user'
import Token from '#models/token'

export default class TwoFactorAuthRequiredException extends ApiException {
  static status = 200

  constructor(private user: User) {
    super()
  }

  protected async payload() {
    const [challengeVerification, resendChallenge] = await Promise.all([
      this.challengeVerificationToken(),
      this.challengeToken(),
    ])

    return {
      twoFactor: true,
      data: {
        tokens: {
          challengeVerification,
          resendChallenge,
        },
      },
    }
  }

  challengeVerificationToken() {
    return Token.sign('two_factor_auth_challenge_verification', this.user.id, {
      oneTimeOnly: true,
    })
  }

  challengeToken() {
    return Token.sign('two_factor_auth_challenge', this.user.id, {
      oneTimeOnly: true,
    })
  }
}
