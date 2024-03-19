import { inject } from '@adonisjs/core'
import OtpMethod from './abstract/otp_method.js'
import User from '#models/user'
import Otp from '#services/auth/otp'

@inject()
export default class SmsMethod extends OtpMethod {
  methodName = 'sms'

  constructor(private readonly otp: Otp) {
    super()
  }
  
  challenge(user: User) {
     this.ensureHasPhoneNumber(user)
    return this.otp.sendThroughSMS(user.phoneNumber, user.twoFactorSecret)
  }
}
