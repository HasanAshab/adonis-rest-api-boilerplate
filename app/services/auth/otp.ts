import Twilio from '@ioc:adonis/addons/twilio'
import User from '#app/models/user'
import Token from '#app/models/token'
import InvalidOtpException from '#app/exceptions/invalid_otp_exception'


export default class Otp {
  public static code() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
  
  public static generate(key: string, expiresIn = '90 seconds') {
    return Token.sign('otp', key, {
      oneTimeOnly: true,
      secret: this.code(),
      expiresIn
    })
  }

  public static async sendThroughSMS(phoneNumber: string, key = phoneNumber) {
    const code = await this.generate(key)
    await Twilio.sendMessage(phoneNumber, 'Your verification code is: ' + code)
    return code
  }

  public static async sendThroughCall(phoneNumber: string, key = phoneNumber) {
    const code = await this.generate(key)
    await Twilio.makeCall(
      phoneNumber, 
      `<Response><Say>Your verification code is ${code}</Say></Response>`
    )
    return code
  }
  
  public static isValid(code: string, key: string) {
    return Token.isValid('otp', key, code)
  }
  
  public static async verify(code: string, key: string) {
    if(!await this.isValid(code, key)) {
      throw new InvalidOtpException
    }
  }
}