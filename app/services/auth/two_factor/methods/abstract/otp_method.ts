import { inject } from '@adonisjs/core'
import TwoFactorMethod from './two_factor_method.js'
import { TwoFactorAuthenticableModelContract } from '#models/traits/auth/two_factor_authenticable'
import Otp from '#services/auth/otp'
import InvalidOtpException from '#exceptions/invalid_otp_exception'
import PhoneNumberRequiredException from '#exceptions/phone_number_required_exception'
import { authenticator } from 'otplib'

@inject()
export default abstract class OtpMethod extends TwoFactorMethod {
  constructor(protected readonly otp: Otp) {
    super()
  }

  protected verificationFailureException() {
    return new InvalidOtpException()
  }

  protected assertAssignable(user: TwoFactorAuthenticableModelContract) {
    this.ensureHasPhoneNumber(user)
  }

  protected ensureHasPhoneNumber(user: TwoFactorAuthenticableModelContract): asserts user is TwoFactorAuthenticableModelContract & { phoneNumber: string } {
    if (!(user as any).phoneNumber) {
      throw new PhoneNumberRequiredException()
    }
  }

  protected setup(user: TwoFactorAuthenticableModelContract) {
    user.twoFactorSecret = authenticator.generateSecret()
  }

  protected cleanup(user: TwoFactorAuthenticableModelContract) {
    user.twoFactorSecret = null
  }

  isValid(user: TwoFactorAuthenticableModelContract, token: string) {
    return this.otp.isValid(token, user.twoFactorSecret)
  }

  shouldDisable(user: TwoFactorAuthenticableModelContract) {
    if (!(user as any).phoneNumber) {
      return true
    }

    // checking if the phone number is changed or not
    if (user.$dirty.phoneNumber && user.phoneNumber !== user.$original.phoneNumber) {
      return true
    }

    return false
  }
}
