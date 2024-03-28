import OtpMethod from './abstract/otp_method.js'
import { TwoFactorAuthenticableModelContract } from '#models/traits/auth/two_factor_authenticable'


export default class CallMethod extends OtpMethod {
  methodName = 'call'

  challenge(user: TwoFactorAuthenticableModelContract) {
    this.ensureHasPhoneNumber(user)
    return this.otp.sendThroughCall(user.phoneNumber, user.twoFactorSecret)
  }
}
