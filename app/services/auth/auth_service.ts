import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
//import { Attachment } from '@ioc:adonis/addons/attachment_lite'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import Token from '#models/token'
import LoggedDevice from '#models/logged_device'
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
  ip: string
  device: DeviceInfo
}

@inject()
export default class AuthService {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  private loginLimiter = limiter.use({
    requests: 5,
    duration: '2 minutes',
    blockDuration: '1 hour',
  })

  private limiterKeyFor(email: string, ip: string) {
    return `login__${email}_${ip}`
  }

  async register(data: RegistrationData) {
    if (data.avatar) {
      data.avatar = Attachment.fromFile(data.avatar)
    }

    const user = await User.create(data)
    //await user.initNotificationPreference()

    return user
  }

  async attempt({ email, password, ip, device }: LoginCredentials) {
    const limiterKey = this.limiterKeyFor(email, ip)
    const [error, user] = await this.loginLimiter.penalize(limiterKey, () => {
      return User.verifyCredentials(email, password)
    })
    if (error) {
      throw error
    }

    const loggedDevice = await LoggedDevice.sync(device)
    const isTrustedDevice = await user.isDeviceTrusted(device.id)
    
    if (user.hasEnabledTwoFactorAuth() && !isTrustedDevice) {
      await this.twoFactorAuthService.challenge(user)
      throw new TwoFactorAuthRequiredException(user)
    }
    await this.reHashPasswordIfNeeded(user, password)

    const accessToken = await user.createToken()
    await user.related('loginSessions').create({
      accessTokenId: accessToken.identifier,
      loggedDeviceId: loggedDevice.id
    })
    await user.related('loggedDevices').sync(
      {
        [loggedDevice.id]: { 
          last_logged_at: DateTime.local(),
          ip_address: ip
        },
      },
      false
    )
    return accessToken
  }

  async logout(user: User) {
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }
  }
  
  async logoutOnDevice(user: User, deviceId: string) {
    await user.related('loggedDevices').detach([deviceId])
    await user.load('loginSessions', query => {
      query.where('loggedDeviceId', deviceId)
    })
    await Promise.all(
      user.loginSessions.map(loginSession => loginSession.delete())
    )
  }

  async sendVerificationMail(user: User | string) {
    if (typeof user === 'string') {
      user = await User.natives().where('email', user).first()
    }

    if (user instanceof User && !user.verified) {
      await mail.sendLater(new EmailVerificationMail(user))
      return true
    }

    return false
  }

  async verifyEmail(id: number, token: string) {
    await Token.verify('verification', id, token)
    await this.markAsVerified(id)
  }

  async markAsVerified(id: number) {
    await User.query().whereUid(id).updateOrFail({ verified: true })
  }

  async changePassword(user: User, oldPassword: string, newPassword: string) {
    if (user.isSocial()) {
      throw new PasswordChangeNotAllowedException()
    }

    if (!(await user.comparePassword(oldPassword))) {
      throw new InvalidPasswordException()
    }

    user.password = newPassword
    await user.save()
  }

  async forgotPassword(user: User | string) {
    if (typeof user === 'string') {
      user = await User.natives().where('email', user).where('verified', true).first()
    }
    if (user instanceof User && user.verified) {
      await mail.sendLater(new ResetPasswordMail(user))
      return true
    }
    return false
  }

  async resetPassword(user: User, token: string, password: string) {
    await Token.verify('password_reset', user.id, token)
    user.password = password
    await user.save()
  }
  
  private async reHashPasswordIfNeeded(user: User, password: string) {
    if (user.isNative() && await hash.needsReHash(user.password)) {
      user.password = password
      await user.save()
    }
  }
}
