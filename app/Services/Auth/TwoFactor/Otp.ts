import Twilio from '@ioc:Adonis/Addons/Twilio'
import User from 'App/Models/User'
import { totp } from 'otplib';


export default class Otp {
  public static generate(user: User) {
    return totp.generate(user.twoFactorSecret)
  }

  public static async sendThroughSMS(user: User) {
    const code = this.generate(user)
    await Twilio.sendMessage(user.phoneNumber, 'Your verification code is: ' + code)
    return code
  }

  public static async sendThroughCall(phoneNumber: string) {
    const code = this.generate(user)
    await Twilio.sendCall(
      user.phoneNumber, 
      `<Response><Say>Your verification code is ${code}</Say></Response>`
    )
    return code
  }
  
  public static isValid(user: User, token: string) {
    return totp.check(token, user.twoFactorSecret)
  }
}