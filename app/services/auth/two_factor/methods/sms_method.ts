import OtpMethod from './abstract/otp_method.js'
import User from '#models/user'

export default class SmsMethod extends OtpMethod {
  methodName = 'sms'

  challenge(user: User) {
    this.ensureHasPhoneNumber(user)
    return this.otp.sendThroughSMS(user.phoneNumber, user.twoFactorSecret)
  }
}
