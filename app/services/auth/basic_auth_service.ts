import type RegisterValidator from '#app/http/validators/v1/auth/register_validator'
import type { Limiter as LimiterContract } from '@adonisjs/limiter/build/src/limiter'
import config from '@adonisjs/core/services/config'
import { Attachment } from '@ioc:adonis/addons/attachment_lite'
import User from '#app/models/user'
import Token from '#app/models/token'
import TwoFactorAuthService from '#app/services/auth/two_factor/two_factor_auth_service'
import EmailVerificationMail from '#app/mails/email_verification_mail'
import ResetPasswordMail from '#app/mails/reset_password_mail'
import InvalidCredentialException from '#app/exceptions/invalid_credential_exception'
import LoginAttemptLimitExceededException from '#app/exceptions/login_attempt_limit_exceeded_exception'
import OtpRequiredException from '#app/exceptions/validation/otp_required_exception'
import PasswordChangeNotAllowedException from '#app/exceptions/password_change_not_allowed_exception'
import TwoFactorAuthRequiredException from '#app/exceptions/two_factor_auth_required_exception'
import { limiter } from "@adonisjs/limiter/services/main";

export interface LoginCredentials {
  email: string
  password: string
  ip?: string
}



export default class BasicAuthService {
  private loginThrottler?: LimiterContract

//todo
  constructor(
    private loginAttemptThrottlerConfig = config.get('auth.loginAttemptThrottler')
  ) {
    if (this.loginAttemptThrottlerconfig.enabled) {
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

    const throttleKey = this.throttleKeyFor(user, ip)

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
    
    await this.loginThrottler?.delete(throttleKey)

    if (user.hasEnabledTwoFactorAuth()) {
      await twoFactorAuthService.challenge(user)
      throw new TwoFactorAuthRequiredException(user)
    }
    
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
      user = await User.internals().where('email', user).where('verified', true).first()
    }
    if(user && user.verified) {
      await new ResetPasswordMail(user).sendLater()
      return true
    }
    return false
  }

  public async resetPassword(user: User, token: string, password: string) {
    await Token.verify('password_reset', user.id, token)
    user.password = password
    await user.save()
  }

  private setupLoginThrottler() {
    const { maxFailedAttempts, duration, blockDuration } = this.loginAttemptThrottlerConfig
    this.loginThrottler = limiter.use({
      requests: maxFailedAttempts,
      blockDuration,
      duration,
    })
  }

  private throttleKeyFor(user: User, ip: string) {
    return this.loginAttemptThrottlerconfig.key
      .replace('{{ email }}', user.email)
      .replace('{{ ip }}', ip)
  }

}
