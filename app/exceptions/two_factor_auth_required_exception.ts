import ApiException from '#app/Exceptions/ApiException'
import type User from '#app/Models/User'
import Token from '#app/Models/Token'


export default class TwoFactorAuthRequiredException extends ApiException {
  public status = 200
  
  constructor(private user: User) {
    super()
  }
  
  protected async payload() {
    const [challengeVerification, resendChallenge] = await Promise.all([
      this.challengeVerificationToken(),
      this.challengeToken()
    ])
    
    return {
      twoFactor: true,
      data: {
        tokens: { 
          challengeVerification,
          resendChallenge
        }
      }
    }
  }
  
  public challengeVerificationToken() {
    return Token.sign('two_factor_auth_challenge_verification', this.user.id, {
      oneTimeOnly: true
    })
  }
  
  public challengeToken() {
    return Token.sign('two_factor_auth_challenge', this.user.id, {
      oneTimeOnly: true
    })
  }
}
