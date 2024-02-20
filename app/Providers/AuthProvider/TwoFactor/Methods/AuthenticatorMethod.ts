import TwoFactorMethod from './Abstract/TwoFactorMethod'
import User from 'App/Models/User'
import { authenticator } from 'otplib';
import InvalidOtpException from 'App/Exceptions/InvalidOtpException'


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