import Twilio from '@ioc:Adonis/Addons/Twilio'
import User from 'App/Models/User'
import { totp } from 'otplib';
import InvalidOtpException from 'App/Exceptions/InvalidOtpException'


export default class Otp {
  public static generate(secret: string) {
    return totp.generate(secret)
  }

  public static async sendThroughSMS(phoneNumber: string, secret = phoneNumber) {
    const code = this.generate(secret)
    await Twilio.sendMessage(phoneNumber, 'Your verification code is: ' + code)
    return code
  }

  public static async sendThroughCall(phoneNumber: string, secret = phoneNumber) {
    const code = this.generate(secret)
    await Twilio.sendCall(
      phoneNumber, 
      `<Response><Say>Your verification code is ${code}</Say></Response>`
    )
    return code
  }
  
  public static isValid(token: string, secret: string) {
    return totp.check(token, secret)
  }
  
  public static verify(token: string, secret: string) {
    if(!this.isValid(token, secret)) {
      throw new InvalidOtpException
    }
  }
}