import OtpMethod from './abstract/otp_method.js'
import User from '#models/user'
import Otp from '#services/auth/otp'

export default class SmsMethod extends OtpMethod {
  methodName = 'sms'

  challenge(user: User) {
    this.ensureHasPhoneNumber(user)
    return Otp.sendThroughSMS(user.phoneNumber, user.twoFactorSecret)
  }
}
