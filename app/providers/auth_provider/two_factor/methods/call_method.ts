import OtpMethod from './Abstract/OtpMethod.js'
import User from '#app/Models/User'
import Otp from '#app/Services/Auth/Otp'


export default class CallMethod extends OtpMethod {
  public methodName = 'call'
  
  public challenge(user: User) {
    this.ensureHasPhoneNumber(user)
    return Otp.sendThroughCall(user.phoneNumber, user.twoFactorSecret)
  }
}