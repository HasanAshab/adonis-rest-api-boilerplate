import TwoFactorMethod from './Abstract/TwoFactorMethod.js'
import User from '#app/Models/User'
import { authenticator } from 'otplib';
import InvalidOtpException from '#app/Exceptions/InvalidOtpException'


export default class AuthenticatorMethod extends TwoFactorMethod {
  public methodName = 'authenticator'
  
  protected verificationFailureException() {
    return new InvalidOtpException
  }

  protected setup(user: User) {
    user.twoFactorSecret = authenticator.generateSecret()
  }
  
  protected cleanup(user: User) {
    user.twoFactorSecret = null
  }
  
  public isValid(user: User, token: string) {
    return authenticator.check(token, user.twoFactorSecret)
  }
}