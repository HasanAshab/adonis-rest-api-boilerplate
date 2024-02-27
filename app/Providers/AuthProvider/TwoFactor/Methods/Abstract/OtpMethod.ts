import TwoFactorMethod from './TwoFactorMethod.js'
import User from '#app/Models/User'
import Otp from '#app/Services/Auth/Otp'
import InvalidOtpException from '#app/Exceptions/InvalidOtpException'
import PhoneNumberRequiredException from '#app/Exceptions/PhoneNumberRequiredException'
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