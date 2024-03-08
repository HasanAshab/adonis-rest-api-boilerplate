import { range } from 'lodash-es'
import encryption from '@adonisjs/core/services/encryption'
import config from '@adonisjs/core/services/config'
import User from '#models/user'
import twoFactorMethod from '#services/auth/two_factor/two_factor_method_manager'
import RecoveryCode from '#services/auth/two_factor/recovery_code'
import Otp from '#services/auth/two_factor/otp'
import PhoneNumberRequiredException from '#exceptions/phone_number_required_exception'
import InvalidRecoveryCodeException from '#exceptions/invalid_recovery_code_exception'


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
    user.twoFactorRecoveryCodes = encryption.encrypt(JSON.stringify(codes))
    await user.save()
    return codes
  }
}
