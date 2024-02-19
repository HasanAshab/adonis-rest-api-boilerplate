import ApiException from 'App/Exceptions/ApiException'
import Token from 'App/Models/Token'


export default class TwoFactorAuthRequiredException extends ApiException {
  status = 200
  
  protected async payload() {
    return {
      twoFactor: true,
      data: {
        resendChallengeToken: await this.challengeToken()
      }
    }
  }
  
  public challengeToken() {
    return Token.sign('two_factor_auth_challenge', user.id, {
      oneTimeOnly: true
    })
  }
}
