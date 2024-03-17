//import { Attachment } from '@ioc:adonis/addons/attachment_lite'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import Token from '#models/token'
import LoginDevice from '#models/login_device'
import LoginActivity from '#models/login_activity'
import TwoFactorAuthService from '#services/auth/two_factor/two_factor_auth_service'
import mail from '@adonisjs/mail/services/main'
import EmailVerificationMail from '#mails/email_verification_mail'
import ResetPasswordMail from '#mails/reset_password_mail'
import limiter from '@adonisjs/limiter/services/main'
import InvalidCredentialException from '#exceptions/invalid_credential_exception'
import LoginAttemptLimitExceededException from '#exceptions/login_attempt_limit_exceeded_exception'
import OtpRequiredException from '#exceptions/validation/otp_required_exception'
import PasswordChangeNotAllowedException from '#exceptions/password_change_not_allowed_exception'
import InvalidPasswordException from '#exceptions/invalid_password_exception'
import TwoFactorAuthRequiredException from '#exceptions/two_factor_auth_required_exception'


export interface RegistrationData {
  email: string
  username: string
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
  ip: string,
  device: DeviceInfo
}

export default class AuthService {
  private static loginLimiter = limiter.use({
    requests: 5,
    duration: '2 minutes',
    blockDuration: '1 hour'
  })
  
  private static limiterKeyFor(email: string, ip: string) {
    return `login__${email}_${ip}`
  }

  public static async register(data: RegistrationData) {
    if (data.avatar) {
      data.avatar = Attachment.fromFile(data.avatar)
    }

    const user = await User.create(data)
    //await user.initNotificationPreference()

    return user
  }
  
  public static async attempt({ email, password, ip, device }: LoginCredentials) {
    const limiterKey = this.limiterKeyFor(email, ip)
    const [error, user] = await this.loginLimiter.penalize(limiterKey, async () => {
      const user = await User.verifyCredentials(email, password)
      return user
    })
    if(error) {
      throw error
    }
    
    const loginDevice = await LoginDevice.firstOrCreate(
      { id: device.id },
      {
        type: device.type,
        vendor: device.vendor,
        model: device.model
      }
    )

    if (user.hasEnabledTwoFactorAuth() && !loginDevice.isTrusted) {
      await TwoFactorAuthService.challenge(user)
      throw new TwoFactorAuthRequiredException(user)
    }

    if (await hash.needsReHash(user.password)) {
      user.password = password
      await user.save()
    }
    
    const accessToken = await user.createToken()
    
    await user.related('loginActivities').create({
      deviceId: loginDevice.id,
      accessTokenId: accessToken.identifier,
      ip
    })
    
    return accessToken
  }
  
  public static async logout(user: User) {
    if(user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }
  }

  public static async sendVerificationMail(user: User | string) {
    if (typeof user === 'string') {
      user = await User
        .query()
        .whereNotNull('password')
        .where('email', user)
        .first()
    }

    if (!user || user.verified) {
      return false
    }

    await mail.sendLater(new EmailVerificationMail(user))
    return true
  }
  
  public static async verifyEmail(id: number, token: string) {
    await Token.verify('verification', id, token)
    await this.markAsVerified(id)
  }
  
  public static async markAsVerified(id: number) {
    await User.query().whereUid(id).updateOrFail({ verified: true });
  }
  
  public static async changePassword(user: User, oldPassword: string, newPassword: string) {
    if (user.isSocial()) {
      throw new PasswordChangeNotAllowedException()
    }

    if(!await user.comparePassword(oldPassword)) {
      throw new InvalidPasswordException()
    }

    user.password = newPassword
    await user.save()
  }

  public static async forgotPassword(user: User | string) {
    if (typeof user === 'string') {
      user = await User.internals().where('email', user).where('verified', true).first()
    }
    if(user && user.verified) {
      await mail.sendLater(new ResetPasswordMail(user))
      return true
    }
    return false
  }

  public static async resetPassword(user: User, token: string, password: string) {
    await Token.verify('password_reset', user.id, token)
    user.password = password
    await user.save()
  }
}
