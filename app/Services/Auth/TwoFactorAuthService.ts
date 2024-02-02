import { inject } from '@adonisjs/fold'
import { DateTime } from 'luxon'
import { randomBytes } from 'crypto'
import Hash from '@ioc:Adonis/Core/Hash'
import Config from '@ioc:Adonis/Core/Config'
import Twilio from '@ioc:Adonis/Addons/Twilio'
import User from 'App/Models/User'
import type { TwoFactorAuthSettings } from 'App/Models/Settings'
import Token from 'App/Models/Token'
import speakeasy from 'speakeasy'
import PhoneNumberRequiredException from 'App/Exceptions/PhoneNumberRequiredException'
import InvalidOtpException from 'App/Exceptions/InvalidOtpException'
import InvalidRecoveryCodeException from 'App/Exceptions/InvalidRecoveryCodeException'

export interface TwoFactorAuthData {
  recoveryCodes: string[]
  otpAuthUrl?: string
}

//TODO configurable
@inject()
export default class TwoFactorAuthService {
  //TODO with direct query
  public async enable(user: User, method?: TwoFactorAuthSettings['method']) {
    if (!user.phoneNumber && method !== 'app') {
      throw new PhoneNumberRequiredException()
    }

    const data: TwoFactorAuthData = {
      recoveryCodes: await this.generateRecoveryCodes(user),
    }

    await user.loadIfNotLoaded('settings')
    const { twoFactorAuth } = user.settings
    twoFactorAuth.enabled = true
    twoFactorAuth.method = method ?? twoFactorAuth.method

    if (method === 'app') {
      twoFactorAuth.secret = speakeasy.generateSecret({ length: 20 }).ascii
      const appName = Config.get<string>('app.name')

      data.otpAuthUrl = speakeasy.otpauthURL({
        secret: twoFactorAuth.secret,
        label: appName,
        issuer: appName,
      })
    }

    await user.settings.save()
    return data
  }

  async disable(user: User) {
    await user.loadIfNotLoaded('settings')
    user.settings.twoFactorAuth.enabled = false
    await user.settings.save()
  }

  async sendOtp(user: User, method?: 'sms' | 'call') {
    if (!user.phoneNumber) {
      return null
    }

    if (!method) {
      await user.loadIfNotLoaded('settings')
      method = user.settings.twoFactorAuth.method
      if (method === 'app') {
        return null
      }
    }

    const code = await this.createToken(user)

    if (method === 'sms') {
      await Twilio.sendMessage(user.phoneNumber, 'Your verification code is: ' + code)
    } else if (method === 'call') {
      await Twilio.makeCall(
        user.phoneNumber,
        `<Response><Say>Your verification code is ${code}</Say></Response>`
      )
    }

    return code
  }

  public async verifyOtp(user: User, method: TwoFactorAuthSettings['method'], code: string) {
    let isValid = false

    if (method === 'app') {
      await user.loadIfNotLoaded('settings')
      const { secret } = user.settings.twoFactorAuth
      if (!secret) {
        throw new Error("Can not verify otp through 'app' method without having secret")
      }
      isValid = speakeasy.totp.verify({
        secret,
        encoding: 'ascii',
        token: code,
        window: 2,
      })
    } else {
      isValid = await Token.isValid(user.id, '2fa', code)
    }

    if (!isValid) {
      throw new InvalidOtpException()
    }
  }

  public async createToken(user: User, code = this.generateOTPCode()) {
    await Token.create({
      key: user.id,
      type: '2fa',
      secret: code,
      expiresAt: DateTime.local().plus({ days: 3 }),
    })
    return code
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

  public generateOTPCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
}
