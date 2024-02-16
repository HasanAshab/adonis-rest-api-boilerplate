import Twilio from '@ioc:Adonis/Addons/Twilio'
import Token from 'App/Models/Token'
import { DateTime } from 'luxon'
import { string } from '@ioc:Adonis/Core/Helpers'


export default class OtpService {
  public code() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  public async token(phoneNumber: string, expiresIn: string, code = this.otpCode()) {
    const secret = this.code()
    await Token.create({
      key: phoneNumber,
      type: 'otp',
      oneTime: true,
      secret,
      expiresAt: DateTime.local().plus(string.toMs(expiresIn))
    })
    return secret
  }
  
  public async sendThroughSMS(phoneNumber: string, expiresIn: string) {
    const code = await this.token(phoneNumber, expiresIn)
    await Twilio.sendMessage(phoneNumber, 'Your verification code is: ' + code)
  }

  public async sendThroughCall(phoneNumber: string, expiresIn: string) {
    const code = await this.token(phoneNumber, expiresIn)
    await Twilio.sendCall(
      phoneNumber, 
      `<Response><Say>Your verification code is ${code}</Say></Response>`
    )
  }
  
  public isValid(phoneNumber: string, code: number) {
    return Token.isValid(phoneNumber, 'otp', code)
  }
  
  public verify(phoneNumber: string, code: number) {
    return Token.verify(phoneNumber, 'otp', code)
  }
}