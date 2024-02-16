import Twilio from '@ioc:Adonis/Addons/Twilio'

export default class OtpService {
  public sendThroughSMS(phoneNumber: string) {
    return Twilio.sendMessage(phoneNumber, 'Your verification code is: ' + this.otpCode())
  }

  public sendThroughCall(phoneNumber: string) {
    return Twilio.sendCall(
      phoneNumber, 
      `<Response><Say>Your verification code is ${this.otpCode()}</Say></Response>`
    )
  }
}