import TwoFactorMethod from './abstract/two_factor_method.js'
import { TwoFactorAuthenticableModelContract } from '#models/traits/auth/two_factor_authenticable'
import { authenticator } from 'otplib'
import InvalidOtpException from '#exceptions/invalid_otp_exception'

export default class AuthenticatorMethod extends TwoFactorMethod {
  methodName = 'authenticator'

  protected verificationFailureException() {
    return new InvalidOtpException()
  }

  protected setup(user: TwoFactorAuthenticableModelContract) {
    user.twoFactorSecret = authenticator.generateSecret()
  }

  protected cleanup(user: TwoFactorAuthenticableModelContract) {
    user.twoFactorSecret = null
  }

  isValid(user: TwoFactorAuthenticableModelContract, token: string) {
    return authenticator.check(token, user.twoFactorSecret)
  }
}
