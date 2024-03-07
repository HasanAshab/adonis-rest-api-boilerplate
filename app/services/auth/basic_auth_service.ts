import type RegisterValidator from '#validators/v1/auth/register_validator'
import config from '@adonisjs/core/services/config'
import { inject } from '@adonisjs/core'
import { Attachment } from '@ioc:adonis/addons/attachment_lite'
import User from '#models/user'
import Token from '#models/token'
import TwoFactorAuthService from '#services/auth/two_factor/two_factor_auth_service'
import EmailVerificationMail from '#mails/email_verification_mail'
import ResetPasswordMail from '#mails/reset_password_mail'
import InvalidCredentialException from '#exceptions/invalid_credential_exception'
import LoginAttemptLimitExceededException from '#exceptions/login_attempt_limit_exceeded_exception'
import OtpRequiredException from '#exceptions/validation/otp_required_exception'
import PasswordChangeNotAllowedException from '#exceptions/password_change_not_allowed_exception'
import TwoFactorAuthRequiredException from '#exceptions/two_factor_auth_required_exception'
import { limiter } from "@adonisjs/limiter/services/main";

export interface LoginCredentials {
  email: string
  password: string
  ip: string
}



export default class BasicAuthService {
  private loginThrottler = limiter.use({
    requests: 5,
    duration: '15 minutes',
    blockDuration: '1 hour'
  })


  public async register(data: RegisterValidator['__type']) {
    if (data.avatar) {
      data.avatar = Attachment.fromFile(data.avatar)
    }

    const user = await User.create(data)
    await user.related('settings').create()

    return user
  }

  @inject()
  public async attempt(
    { email, password, ip }: LoginCredentials, 
    twoFactorAuthService: TwoFactorAuthService
  ) {
    const throttleKey = this.throttleKeyFor(user, ip)

    if (await this.loginThrottler.isBlocked(throttleKey)) {
      throw new LoginAttemptLimitExceededException()
    }

    const user = await User.internals().where('email', email).first()

    if (!user) {
      throw new InvalidCredentialException()
    }

    if (!(await user.comparePassword(password))) {
      await this.loginThrottler.increment(throttleKey)
      throw new InvalidCredentialException()
    }
    
    await this.loginThrottler.delete(throttleKey)

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


  private throttleKeyFor(user: User, ip: string) {
    return `login__${user.email}_${ip}`
  }

}
