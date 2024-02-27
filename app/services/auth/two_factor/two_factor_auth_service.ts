import { range } from 'lodash'
import Encryption from '@ioc:Adonis/Core/Encryption'
import Config from '@ioc:Adonis/Core/Config'
import User from '#app/Models/User'
import { TwoFactorMethod } from '@ioc:Adonis/Addons/Auth/TwoFactor'
import RecoveryCode from '#app/Services/Auth/TwoFactor/RecoveryCode'
import Otp from '#app/Services/Auth/TwoFactor/Otp'
import PhoneNumberRequiredException from '#app/Exceptions/PhoneNumberRequiredException'
import InvalidRecoveryCodeException from '#app/Exceptions/InvalidRecoveryCodeException'


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
