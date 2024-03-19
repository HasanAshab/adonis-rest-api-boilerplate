import twilio from '#ioc/twilio'
import User from '#models/user'
import Token from '#models/token'
import InvalidOtpException from '#exceptions/invalid_otp_exception'

export default class Otp {
  code() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  generate(key: string, expiresIn = '90 seconds') {
    return Token.sign('otp', key, {
      oneTimeOnly: true,
      secret: this.code(),
      expiresIn,
    })
  }

  async sendThroughSMS(phoneNumber: string, key = phoneNumber) {
    const code = await this.generate(key)
    await twilio.sendMessage(phoneNumber, 'Your verification code is: ' + code)
    return code
  }

  async sendThroughCall(phoneNumber: string, key = phoneNumber) {
    const code = await this.generate(key)
    await twilio.makeCall(
      phoneNumber,
      `<Response><Say>Your verification code is ${code}</Say></Response>`
    )
    return code
  }

  isValid(code: string, key: string) {
    return Token.isValid('otp', key, code)
  }

  async verify(code: string, key: string) {
    if (!(await this.isValid(code, key))) {
      throw new InvalidOtpException()
    }
  }
}
