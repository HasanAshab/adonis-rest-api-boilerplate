import { range } from 'lodash-es'
import encryption from '@adonisjs/core/services/encryption'
import User from '#models/user'
import LoggedDevice from '#models/logged_device'
import twoFactorMethod from '#services/auth/two_factor/two_factor_method_manager'
import RecoveryCode from '#services/auth/two_factor/recovery_code'
import InvalidRecoveryCodeException from '#exceptions/invalid_recovery_code_exception'
import { TwoFactorChallengeVerificationData } from '#interfaces/auth'

export default class TwoFactorAuthService {
  enable(user: User, method: string) {
    return twoFactorMethod.use(method).enable(user)
  }

  disable(user: User) {
    return twoFactorMethod.use(user.twoFactorMethod ?? 'authenticator').disable(user)
  }

  changeMethod(user: User, method: string) {
    return twoFactorMethod.use(method).assign(user)
  }

  challenge(user: User) {
    return twoFactorMethod.use(user.twoFactorMethod).challenge(user)
  }

  async verify(user: User, { code, ipAddress, device, options = {} }: TwoFactorChallengeVerificationData) {
    await twoFactorMethod.use(user.twoFactorMethod).verify(user, code)
    await LoggedDevice.sync(device)
    if (options.trustThisDevice) {
      await user.trustDevice(device.id, ipAddress)
    }
    return await user.createTrackableToken(device.id, ipAddress)
  }

  async recover(email: string, code: string) {
    const user = await User.findByOrFail('email', email)
    if (!user.isValidRecoveryCode(code)) {
      throw new InvalidRecoveryCodeException()
    }
    await user.replaceRecoveryCode(code)
    return await user.createToken()
  }

  async generateRecoveryCodes(user: User, count = 8) {
    const codes = range(count).map(RecoveryCode.generate)
    user.twoFactorRecoveryCodes = encryption.encrypt(JSON.stringify(codes))
    await user.save()
    return codes
  }
}
