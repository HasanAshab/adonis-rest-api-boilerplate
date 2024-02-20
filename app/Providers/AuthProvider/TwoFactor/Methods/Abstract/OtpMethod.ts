import TwoFactorMethod from './TwoFactorMethod'
import User from 'App/Models/User'
import Otp from 'App/Services/Auth/Otp'
import InvalidOtpException from 'App/Exceptions/InvalidOtpException'
import PhoneNumberRequiredException from 'App/Exceptions/PhoneNumberRequiredException'


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

  public isValid(user: User, token: string) {
    return Otp.isValid(token, user.twoFactorSecret)
  }
}