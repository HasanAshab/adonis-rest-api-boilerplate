import OtpMethod from './Abstract/OtpMethod.js'
import User from '#app/Models/User'
import Otp from '#app/Services/Auth/Otp'


export default class SmsMethod extends OtpMethod {
  public methodName = 'sms'
  
  public challenge(user: User) {
    this.ensureHasPhoneNumber(user)
    return Otp.sendThroughSMS(user.phoneNumber, user.twoFactorSecret)
  }
}