import OtpMethod from './abstract/otp_method.js'
import { TwoFactorAuthenticableModelContract } from '#models/traits/auth/two_factor_authenticable'

export default class SmsMethod extends OtpMethod {
  methodName = 'sms'

  challenge(user: TwoFactorAuthenticableModelContract) {
    this.ensureHasPhoneNumber(user)
    return this.otp.sendThroughSMS(user.phoneNumber, user.twoFactorSecret)
  }
}
