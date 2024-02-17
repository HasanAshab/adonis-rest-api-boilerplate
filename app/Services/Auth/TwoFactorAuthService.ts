import { randomBytes } from 'crypto'
import Hash from '@ioc:Adonis/Core/Hash'
import Config from '@ioc:Adonis/Core/Config'
import User from 'App/Models/User'
import OtpService from 'App/Services/OtpService'
import speakeasy from 'speakeasy'
import PhoneNumberRequiredException from 'App/Exceptions/PhoneNumberRequiredException'
import InvalidOtpException from 'App/Exceptions/InvalidOtpException'
import InvalidRecoveryCodeException from 'App/Exceptions/InvalidRecoveryCodeException'

export interface TwoFactorAuthData {
  recoveryCodes: string[]
  otpAuthUrl?: string
}

//TODO configurable
export default class TwoFactorAuthService {
  //TODO with direct query
  public async enable(user: User, method?: User['twoFactorMethod']) {
    if (!user.phoneNumber && method !== 'app') {
      throw new PhoneNumberRequiredException()
    }

    const data: TwoFactorAuthData = {
      recoveryCodes: await this.generateRecoveryCodes(user),
    }

    user.twoFactorSecret = this.secret()
    user.twoFactorMethod = method ?? user.twoFactorAuthMethod

    if (method === 'app') {
      data.otpAuthUrl = this.otpAuthUrl(user)
    }

    await user.save()
    return data
  }

  public async disable(user: User) {
    user.twoFactorSecret = null
    await user.save()
  }

  //todo
  public async verifyOtp(user: User, code: string, otpService = new OtpService) {
    let isValid = false

    if (method === 'app') {
      if (!user.twoFactorSecret) {
        throw new Error("Can not verify otp through 'app' method without having secret")
      }
      
      isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'ascii',
        token: code,
        window: 2,
      })
    } else {
      isValid = await otpService.isValid(user.phoneNumber, code)
    }

    if (!isValid) {
      throw new InvalidOtpException()
    }
  }

  public async recover(email: string, code: string) {
    const user = await User.findByOrFail('email', email)
    await this.verifyRecoveryCode(user, code)
    return await user.createToken()
  }

  public async generateRecoveryCodes(user: User, count = 10) {
    const rawCodes: string[] = []
    const promises: Promise<void>[] = []
    for (let i = 0; i < count; i++) {
      const generateCode = async () => {
        const code = randomBytes(8).toString('hex')
        rawCodes.push(code)
        user.recoveryCodes.push(await Hash.make(code))
      }
      promises.push(generateCode())
    }
    await Promise.all(promises)
    await user.save()
    return rawCodes
  }

  public async verifyRecoveryCode(user: User, code: string) {
    for (const [index, hashedCode] of user.recoveryCodes.entries()) {
      if (!(await Hash.verify(hashedCode, code))) continue

      user.recoveryCodes.splice(index, 1)
      await user.save()
      return
    }
    throw new InvalidRecoveryCodeException()
  }

  private secret(length = 20) {
    return speakeasy.generateSecret({ length }).ascii
  }
  
  private otpAuthUrl(user: User) {
    if (!user.twoFactorSecret) {
      throw new Error("Can not make otp auth url without having secret.")
    }
    return speakeasy.otpauthURL({
      secret: user.twoFactorSecret,
      label: Config.get('app.name'),
      issuer: Config.get('app.name'),
    })
  }
}
