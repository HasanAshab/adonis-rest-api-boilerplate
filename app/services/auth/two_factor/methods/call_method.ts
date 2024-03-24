import OtpMethod from './abstract/otp_method.js'
import User from '#models/user'

export default class CallMethod extends OtpMethod {
  methodName = 'call'

  challenge(user: User) {
    this.ensureHasPhoneNumber(user)
    return this.otp.sendThroughCall(user.phoneNumber, user.twoFactorSecret)
  }
}
