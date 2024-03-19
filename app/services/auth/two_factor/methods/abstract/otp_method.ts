import { inject } from '@adonisjs/core'
import TwoFactorMethod from './two_factor_method.js'
import User from '#models/user'
import Otp from '#services/auth/otp'
import InvalidOtpException from '#exceptions/invalid_otp_exception'
import PhoneNumberRequiredException from '#exceptions/phone_number_required_exception'
import { authenticator } from 'otplib'


@inject()
export default abstract class OtpMethod extends TwoFactorMethod {
  constructor(private readonly otp: Otp) {
    super()
  }
  
  protected verificationFailureException() {
    return new InvalidOtpException()
  }

  protected assertAssignable(user: User) {
    this.ensureHasPhoneNumber(user)
  }

  protected ensureHasPhoneNumber(user: User): asserts user is user & { phoneNumber: string } {
    if (!user.phoneNumber) {
      throw new PhoneNumberRequiredException()
    }
  }

  protected setup(user: User) {
    user.twoFactorSecret = authenticator.generateSecret()
  }

  protected cleanup(user: User) {
    user.twoFactorSecret = null
  }
  
  isValid(user: User, token: string) {
    return this.otp.isValid(token, user.twoFactorSecret)
  }

  shouldDisable(user: User) {
    if (!user.phoneNumber) {
      return true
    }

    // checking if the phone number is changed or not
    if (user.$dirty.phoneNumber && user.phoneNumber !== user.$original.phoneNumber) {
      return true
    }

    return false
  }
}
