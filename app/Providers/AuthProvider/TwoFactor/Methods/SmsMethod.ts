import OtpMethod from './Abstract/OtpMethod'
import User from 'App/Models/User'
import Otp from 'App/Services/Auth/Otp'


export default class SmsMethod extends OtpMethod {
  public methodName = 'sms'
  
  public async challenge(user: User) {
    this.ensureHasPhoneNumber(user)
    await Otp.sendThroughSMS(user.phoneNumber, user.twoFactorSecret)
  }
}