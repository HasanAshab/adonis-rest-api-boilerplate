import TwoFactorMethod from './two_factor_method.js'
import User from '#models/user'
import Otp from '#app/services/auth/otp'
import InvalidOtpException from '#exceptions/invalid_otp_exception'
import PhoneNumberRequiredException from '#exceptions/phone_number_required_exception'
import { authenticator } from 'otplib';


export default abstract class OtpMethod extends TwoFactorMethod {
  protected verificationFailureException() {
    return new InvalidOtpException
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

  public isValid(user: User, token: string) {
    return Otp.isValid(token, user.twoFactorSecret)
  }
}