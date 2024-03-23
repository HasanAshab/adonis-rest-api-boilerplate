import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import router from '@adonisjs/core/services/router'
import User from '#models/user'
import Token from '#models/token'
import Registered from '#events/registered'
import mail from '@adonisjs/mail/services/main'
import PasswordChangedMail from '#mails/password_changed_mail'
import { registerValidator } from '#validators/v1/auth/register_validator'
import { loginValidator, socialAuthTokenLoginValidator } from '#validators/v1/auth/login_validator'
import {
  emailVerificationValidator,
  resendEmailVerificationValidator,
} from '#validators/v1/auth/email_validator'
import {
  forgotPasswordValidator,
  resetPasswordValidator,
} from '#validators/v1/auth/password_validator'
import {
  twoFactorChallengeValidator,
  twoFactorChallengeVerificationValidator,
  twoFactorAccountRecoveryValidator,
} from '#validators/v1/auth/two_factor_validator'
import AuthService from '#services/auth/auth_service'
import TwoFactorAuthService from '#services/auth/two_factor/two_factor_auth_service'
import SocialAuthService from '#services/auth/social_auth_service'
import { SocialAuthData } from '#interfaces/auth'


@inject()
export default class AuthController {
  static readonly VERSION = 'v1'

  constructor(
    private readonly authService: AuthService,
    private readonly socialAuthService: SocialAuthService,
    private readonly twoFactorAuthService: TwoFactorAuthService
  ) {}

  /**
   * @register
   * @summary Register a new user
   * @requestBody { email: string, username: string, password: string, recaptchaResponse: string }
   * @requestFormDataBody { "email": { "type": "string" }, "username": { "type": "string" }, "password": { "type": "string" }, "avatar": { "type": "string", "format": "binary" }, "recaptchaResponse": { "type": "string" } }
   * @responseBody 201 - { "message": "Verification email sent", "data": <User> }
   * @responseHeader 201 - Location - URL of the registered user's profile
   */
  async register({ request, response }: HttpContext) {
    const registrationData = await request.validateUsing(registerValidator)
    const user = await this.authService.register(registrationData)

    Registered.dispatch(user, 'internal', AuthController.VERSION)

    const profileUrl = router.makeUrl(AuthController.VERSION + ".users.show", {
      username: user.username 
    });

    response
      .header('Location', profileUrl)
      .created({
        message: 'Verification email sent!',
        data: user,
      })
  }

  /**
   * @login
   * @summary Login a user
   * @requestBody { email: string, password: string, recaptchaResponse: string }
   * @requestHeader - 
   * @responseBody 200 - { message: "Logged in successfully!", data: { token: } }
   * @responseBody 401 - { message: "Invalid credentials" }
   * @responseBody 200 - { twoFactor: true, data: { tokens: { challengeVerification: string, resendChallenge: string } } }
   */
  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const token = await this.authService.attempt({
      email,
      password,
      ipAddress: request.ip(),
      device: request.device()
    })

    return {
      message: 'Logged in successfully!',
      data: { token },
    }
  }

  /**
   * @logout
   * @summary Logout a user
   * @responseBody 200 - { message: "Logged out successfully" }
   */
  async logout({ auth }: HttpContext) {
    await this.authService.logout(auth.user!)
    return 'Logged out successfully!'
  }
  
  /**
   * @logoutOnDevice
   * @summary Logout a user on specific device
   * @responseBody 200 - { message: "Logged out successfully" }
   */ 
  async logoutOnDevice({ request, params, auth }: HttpContext) {
    await this.authService.logoutOnDevice(auth.user!, params.id)
    return 'Logged out successfully!'
  }

  /**
   * @verifyEmail
   * @summary Verify email
   * @requestBody { id: string, token: string }
   * @responseBody 200 - { message: "Email verified successfully" }
   */
  async verifyEmail({ request }) {
    const { id, token } = await request.validateUsing(emailVerificationValidator)
    await this.authService.verifyEmail(id, token)
    return 'Email verified successfully!'
  }

  /**
   * @resendEmailVerification
   * @summary Resend email verification
   * @requestBody { email: string }
   * @responseBody 202 - { message: "Verification link sent to email" }
   */
  async resendEmailVerification({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(resendEmailVerificationValidator)
    await this.authService.sendVerificationMail(email)
    response.accepted('Verification link sent to email!')
  }

  /**
   * @forgotPassword
   * @summary Forgot password
   * @requestBody { email: string }
   * @responseBody 202- { message: "Password reset link sent to your email" }
   */
  async forgotPassword({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    await this.authService.forgotPassword(email)
    response.accepted('Password reset link sent to your email!')
  }

  /**
   * @resetPassword
   * @summary Reset password
   * @requestBody { id: string, token: string, password: string }
   * @responseBody 200 - { message: "Password changed successfully" }
   * @responseBody 401 - { message: "Invalid credentials" }
   */
  async resetPassword({ request }: HttpContext) {
    const { id, token, password } = await request.validateUsing(resetPasswordValidator)
    const user = await User.findOrFail(id)
    await this.authService.resetPassword(user, token, password)
    await mail.sendLater(new PasswordChangedMail(user))
    return 'Password changed successfully!'
  }

  /**
   * @twoFactorChallenge
   * @summary Send two factor challenge
   * @requestBody { email: string, token: string }
   * @responseBody 200 - { message: string }
   * @responseBody 401 - { message: "invalid token" }
   */
  async sendTwoFactorChallenge({ request }) {
    const { email, token } = await request.validateUsing(twoFactorChallengeValidator)
    const user = await User.findByOrFail('email', email)
    if(user.hasEnabledTwoFactorAuth()) {
      await Token.verify('two_factor_auth_challenge', user.id, token)
      await this.twoFactorAuthService.challenge(user)
    }
    return 'Challenge sent!'
  }

  /**
   * @verifyTwoFactorChallenge
   * @summary Verify two factor challenge
   * @requestBody { email: string, token: string, code: string, trustThisDevice: boolean }
   * @responseBody 200 - { data: { token:  } }
   * @responseBody 401 - { message: "invalid token" }
   * @responseBody 401 - { message: "invalid otp, please try again" }
   */
  async verifyTwoFactorChallenge({ request }: HttpContext) {
    const { email, token, code, trustThisDevice } = await request.validateUsing(
      twoFactorChallengeVerificationValidator
    )
    const user = await User.findByOrFail('email', email)
    const accessToken = await this.twoFactorAuthService.verify(user, {
      code,
      ipAddress: request.ip(),
      device: request.device(),
      options: { trustThisDevice }
    })
    await Token.verify('two_factor_auth_challenge_verification', user.id, token)

    return {
      message: 'Challenge completed!',
      data: { token: accessToken },
    }
  }

  /**
   * @generateRecoveryCodes
   * @summary Generate recovery codes
   * @responseBody 200 - { data: string[] }
   */
  generateRecoveryCodes({ auth }: AuthenticRequest) {
    return this.twoFactorAuthService.generateRecoveryCodes(auth.user!)
  }

  /**
   * @recoverTwoFactorAccount
   * @summary Recover two factor account
   * @requestBody { email: string, code: string }
   * @responseBody 200 - { message: "Account recovered successfully!", data: { token: } }
   * @responseBody 401 - { message: "invalid recovery code" }
   */
  async recoverTwoFactorAccount({ request }: HttpContext) {
    const { email, code } = await request.validateUsing(twoFactorAccountRecoveryValidator)
    const token = await this.twoFactorAuthService.recover(email, code)

    return {
      message: 'Account recovered successfully!',
      data: { token },
    }
  }

  /**
   * @loginWithSocialAuthToken
   * @summary Login with social auth token
   * @description Login with social auth token from social provider
   * @requestBody { email: string, username: string, token: string }
   * @responseBody 200 - { message: "Logged in successfully!", data: { token: } }
   * @responseBody 201 - { message: "Registered successfully!", data: { user: User, token: } }
   * @responseHeader 201 - Location - URL of the registered user's profile
   * @responseBody 422 - { errors: [{ field: "email", rule: "unique" }, { field: "username", rule: "unique" }] }
   * @responseBody 422 - { errors: [{ field: "email", rule: "unique" }] }
   * @responseBody 422 - { errors: [{ field: "username", rule: "unique" }] }
   * @responseBody 422 - { errors: [{ field: "email", rule: "required" }] }
   * @responseBody 422 - { errors: [{ field: "username", rule: "required" }] }
   */
  async loginWithSocialAuthToken({ request, response, params, ally }: HttpContext) {
    let {
      email,
      username,
      token: socialToken,
    } = await request.validateUsing(socialAuthTokenLoginValidator)

    const data: SocialAuthData = await ally.use(params.provider).userFromToken(socialToken)

    data.username = username
    if (email) {
      data.email = email
      data.emailVerificationState = 'unverified'
    }

    const { user, isRegisteredNow } = await this.socialAuthService.sync(params.provider, data)
    const token = await user.createToken()

    if (!isRegisteredNow) {
      return {
        message: 'Logged in successfully!',
        data: { token, user },
      }
    }

    Registered.dispatch(user, 'social', AuthController.VERSION)

    const profileUrl = router.makeUrl(AuthController.VERSION + ".users.show", {
      username: user.username 
    })

    response
      .header('Location', profileUrl)
      .created({
        message: 'Registered successfully!',
        data: { user, token },
      })
  }
}
