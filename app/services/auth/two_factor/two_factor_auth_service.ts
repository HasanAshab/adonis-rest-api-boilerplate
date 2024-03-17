import { range } from 'lodash-es'
import encryption from '@adonisjs/core/services/encryption'
import config from '@adonisjs/core/services/config'
import User from '#models/user'
import LoginDevice from '#models/login_device'
import twoFactorMethod from '#services/auth/two_factor/two_factor_method_manager'
import RecoveryCode from '#services/auth/two_factor/recovery_code'
import Otp from '#services/auth/two_factor/otp'
import PhoneNumberRequiredException from '#exceptions/phone_number_required_exception'
import InvalidRecoveryCodeException from '#exceptions/invalid_recovery_code_exception'


export default class TwoFactorAuthService {
  public static enable(user: User, method: string) {
    return twoFactorMethod.use(method).enable(user)
  }

  public static disable(user: User) {
    return twoFactorMethod.use(user.twoFactorMethod ?? 'authenticator').disable(user)
  }
  
  public static changeMethod(user: User, method: string) {
    return twoFactorMethod.use(method).assign(user)
  }
  
  public static challenge(user: User) {
    return twoFactorMethod.use(user.twoFactorMethod).challenge(user)
  }
  
  public static async verify(user: User, token: string, deviceId?: string) {
    if(deviceId) {
      await LoginDevice.markAsTrusted(deviceId)
    }
    await twoFactorMethod.use(user.twoFactorMethod).verify(user, token)
    return await user.createToken()
  }

  public static async recover(email: string, code: string) {
    const user = await User.findByOrFail('email', email)
    if(!user.isValidRecoveryCode(code)) {
      throw new InvalidRecoveryCodeException()
    }
    await user.replaceRecoveryCode(code)
    return await user.createToken()
  }

  public static async generateRecoveryCodes(user: User, count = 8) {
    const codes = range(count).map(RecoveryCode.generate)
    user.twoFactorRecoveryCodes = encryption.encrypt(JSON.stringify(codes))
    await user.save()
    return codes
  }
}
