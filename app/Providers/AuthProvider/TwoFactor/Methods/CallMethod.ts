import OtpMethod from './Abstract/OtpMethod'
import User from 'App/Models/User'
import Otp from 'App/Services/Auth/Otp'


export default class CallMethod extends OtpMethod {
  public methodName = 'call'
  
  public async challenge(user: User) {
    this.ensureHasPhoneNumber(user)
    await Otp.sendThroughCall(user.phoneNumber, user.twoFactorSecret)
  }
}