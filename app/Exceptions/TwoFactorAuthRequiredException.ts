import ApiException from 'App/Exceptions/ApiException'
import type User from 'App/Models/User'
import Token from 'App/Models/Token'


export default class TwoFactorAuthRequiredException extends ApiException {
  public status = 200
  
  constructor(private user: User) {
    super()
  }
  
  protected async payload() {
    return {
      twoFactor: true,
      data: {
        resendChallengeToken: await this.challengeToken()
      }
    }
  }
  
  public challengeToken() {
    return Token.sign('two_factor_auth_challenge', this.user.id, {
      oneTimeOnly: true
    })
  }
}
