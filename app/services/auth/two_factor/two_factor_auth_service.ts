import { range } from 'lodash'
import Encryption from '@ioc:adonis/core/encryption'
import Config from '@ioc:adonis/core/config'
import User from '#app/models/user'
import { TwoFactorMethod } from '@ioc:adonis/addons/auth/two_factor'
import RecoveryCode from '#app/services/auth/two_factor/recovery_code'
import Otp from '#app/services/auth/two_factor/otp'
import PhoneNumberRequiredException from '#app/exceptions/phone_number_required_exception'
import InvalidRecoveryCodeException from '#app/exceptions/invalid_recovery_code_exception'


export default class TwoFactorAuthService {
  public enable(user: User, method: string) {
    return TwoFactorMethod.use(method).enable(user)
  }

  public disable(user: User) {
    return TwoFactorMethod.use(user.twoFactorMethod ?? 'authenticator').disable(user)
  }
  
  public changeMethod(user: User, method: string) {
    return TwoFactorMethod.use(method).assign(user)
  }
  
  public challenge(user: User) {
    return TwoFactorMethod.use(user.twoFactorMethod).challenge(user)
  }
  
  public async verify(user: User, token: string) {
    await TwoFactorMethod.use(user.twoFactorMethod).verify(user, token)
    return await user.createToken()
  }

  public async recover(email: string, code: string) {
    const user = await User.findByOrFail('email', email)
    if(!user.isValidRecoveryCode(code)) {
      throw new InvalidRecoveryCodeException()
    }
    await user.replaceRecoveryCode(code)
    return await user.createToken()
  }

  public async generateRecoveryCodes(user: User, count = 8) {
    const codes = range(count).map(RecoveryCode.generate)
    user.twoFactorRecoveryCodes = Encryption.encrypt(JSON.stringify(codes))
    await user.save()
    return codes
  }
}
