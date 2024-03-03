import TwoFactorMethod from './abstract/two_factor_method.js'
import User from '#models/user'
import { authenticator } from 'otplib';
import InvalidOtpException from '#exceptions/invalid_otp_exception'


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