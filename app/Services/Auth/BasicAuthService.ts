import type RegisterValidator from 'App/Http/Validators/V1/Auth/RegisterValidator'
import type { Limiter as LimiterContract } from '@adonisjs/limiter/build/src/limiter'
import Config from '@ioc:Adonis/Core/Config'
import { Limiter } from '@adonisjs/limiter/build/services'
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import User from 'App/Models/User'
import Token from 'App/Models/Token'
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService'
import EmailVerificationMail from 'App/Mails/EmailVerificationMail'
import ResetPasswordMail from 'App/Mails/ResetPasswordMail'
import InvalidCredentialException from 'App/Exceptions/InvalidCredentialException'
import LoginAttemptLimitExceededException from 'App/Exceptions/LoginAttemptLimitExceededException'
import OtpRequiredException from 'App/Exceptions/Validation/OtpRequiredException'
import PasswordChangeNotAllowedException from 'App/Exceptions/PasswordChangeNotAllowedException'

export interface LoginCredentials {
  email: string
  password: string
  otp?: string
  ip?: string
}


export default class BasicAuthService {
  private loginThrottler?: LimiterContract

  constructor(
    private loginAttemptThrottlerConfig = Config.get('auth.loginAttemptThrottler')
  ) {
    if (this.loginAttemptThrottlerConfig.enabled) {
      this.setupLoginThrottler()
    }
  }

  public async register(data: RegisterValidator['__type']) {
    if (data.avatar) {
      data.avatar = Attachment.fromFile(data.avatar)
    }

    const user = await User.create(data)
    await user.related('settings').create()

    return user
  }

  //todo
  public async attempt(
    { email, password, ip }: LoginCredentials, 
    twoFactorAuthService = new TwoFactorAuthService
  ) {
    if (this.loginThrottler && !ip) {
      throw new Error('Argument[3]: "ip" must be provided when login attempt throttling is enabled')
    }

    const throttleKey = this.getThrottleKeyFor(email, ip)

    if (await this.loginThrottler?.isBlocked(throttleKey)) {
      throw new LoginAttemptLimitExceededException()
    }

    const user = await User.internals().where('email', email).first()

    if (!user) {
      throw new InvalidCredentialException()
    }

    if (!(await user.comparePassword(password))) {
      await this.loginThrottler?.increment(throttleKey)
      throw new InvalidCredentialException()
    }
    
    if (user.hasEnabledTwoFactorAuth()) {
      await twoFactorAuthService.challenge(user)
      const resendOtpToken = await Token.sign('two_factor_auth_challenge', user.id, {
        oneTimeOnly: true
      })
      
      return {
        resendOtpToken,
        twoFactor: true
      }
    }
    
    await this.loginThrottler?.delete(throttleKey)

    return await user.createToken()
  }

  public async changePassword(user: User, oldPassword: string, newPassword: string) {
    if (!user.password) {
      throw new PasswordChangeNotAllowedException()
    }

    await user.verifyPassword(oldPassword)

    user.password = newPassword
    await user.save()
  }
  
  public async sendVerificationMail(user: User | string) {
    if (typeof user === 'string') {
      user = await User.internals().where('email', user).first()
    }

    if (!user || user.verified) {
      return false
    }

    await new EmailVerificationMail(user).sendLater()
    return true
  }
  
  public async verifyEmail(id: number, token: string) {
    await Token.verify('verification', id, token)
    await this.markAsVerified(id)
  }
  
  public async markAsVerified(id: number) {
    await User.query().whereUid(id).updateOrFail({ verified: true });
  }

  public async forgotPassword(user: User | string) {
    if (typeof user === 'string') {
      user = await User.internals().where('email', user).first()
      if (!user) return false
    }

    await new ResetPasswordMail(user).sendLater()
    return true
  }

  public async resetPassword(user: User, token: string, password: string) {
    await Token.verify('password_reset', user.id, token)
    user.password = password
    await user.save()
  }

  private setupLoginThrottler() {
    const { maxFailedAttempts, duration, blockDuration } = this.loginAttemptThrottlerConfig
    this.loginThrottler = Limiter.use({
      requests: maxFailedAttempts,
      blockDuration,
      duration,
    })
  }

  private getThrottleKeyFor(email: string, ip: string) {
    return this.loginAttemptThrottlerConfig.key
      .replace('{{ email }}', email)
      .replace('{{ ip }}', ip)
  }

}
