import OtpMethod from './abstract/otp_method.js'
import User from '#models/user'
import Otp from '#services/auth/otp'

export default class CallMethod extends OtpMethod {
  methodName = 'call'

  challenge(user: User) {
    this.ensureHasPhoneNumber(user)
    return Otp.sendThroughCall(user.phoneNumber, user.twoFactorSecret)
  }
}
