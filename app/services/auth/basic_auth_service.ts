import type RegisterValidator from '#validators/v1/auth/register_validator'
import config from '@adonisjs/core/services/config'
import { inject } from '@adonisjs/core'
//import { Attachment } from '@ioc:adonis/addons/attachment_lite'
import User from '#models/user'
import Token from '#models/token'
import TwoFactorAuthService from '#services/auth/two_factor/two_factor_auth_service'
import mail from '@adonisjs/mail/services/main'
import EmailVerificationMail from '#mails/email_verification_mail'
import ResetPasswordMail from '#mails/reset_password_mail'
import limiter from '@adonisjs/limiter/services/main'
import InvalidCredentialException from '#exceptions/invalid_credential_exception'
import LoginAttemptLimitExceededException from '#exceptions/login_attempt_limit_exceeded_exception'
import OtpRequiredException from '#exceptions/validation/otp_required_exception'
import PasswordChangeNotAllowedException from '#exceptions/password_change_not_allowed_exception'
import TwoFactorAuthRequiredException from '#exceptions/two_factor_auth_required_exception'


export interface LoginCredentials {
  email: string
  password: string
  ip: string
}


export default class BasicAuthService {
  private loginLimiter = limiter.use({
    requests: 5,
    duration: '2 minutes',
    blockDuration: '1 hour'
  })


  public async register(data: RegisterValidator['__type']) {
    if (data.avatar) {
      data.avatar = Attachment.fromFile(data.avatar)
    }

    const user = await User.create(data)
    await user.initNotificationPreference()

    return user
  }

  @inject()
  public async attempt(
    { email, password, ip }: LoginCredentials, 
    twoFactorAuthService: TwoFactorAuthService
  ) {
    const limiterKey = this.limiterKeyFor(email, ip)
      
    const [error, user] = await this.loginLimiter.penalize(limiterKey, async () => {
      const user = await User.verifyCredentials(email, password)
      return user
    })
    
    if(error) {
      throw error
    }
  
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

    await mail.sendLater(new EmailVerificationMail(user))
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
      await mail.sendLater(new ResetPasswordMail(user))
      return true
    }
    return false
  }

  public async resetPassword(user: User, token: string, password: string) {
    await Token.verify('password_reset', user.id, token)
    user.password = password
    await user.save()
  }


  private limiterKeyFor(email: string, ip: string) {
    return `login__${email}_${ip}`
  }

}
