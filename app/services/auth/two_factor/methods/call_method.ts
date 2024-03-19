import { inject } from '@adonisjs/core'
import OtpMethod from './abstract/otp_method.js'
import User from '#models/user'
import Otp from '#services/auth/otp'

@inject()
export default class CallMethod extends OtpMethod {
  methodName = 'call'
  
  constructor(private readonly otp: Otp) {
    super()
  }

  challenge(user: User) {
    this.ensureHasPhoneNumber(user)
    return this.otp.sendThroughCall(user.phoneNumber, user.twoFactorSecret)
  }
}
