import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import router from '@adonisjs/core/services/router'
import emitter from '@adonisjs/core/services/emitter'
import User from '#models/user'
import Token from '#models/token'
import BasicAuthService from '#app/services/auth/basic_auth_service'
import TwoFactorAuthService from '#app/services/auth/two_factor/two_factor_auth_service'
import SocialAuthService, { SocialAuthData } from '#app/services/auth/social_auth_service'
import OtpService from '#app/services/otp_service'
import PasswordChangedMail from '#app/mails/password_changed_mail'
import { registerValidator } from '#app/http/validators/v1/auth/register_validator'
import { LoginValidator, socialAuthTokenLoginValidator } from '#app/http/validators/v1/auth/login_validator'
import { emailVerificationValidator, resendEmailVerificationValidator } from '#app/http/validators/v1/auth/email_validator'
import { forgotPasswordValidator, resetPasswordValidator } from '#app/http/validators/v1/auth/password_validator'
import { 
  twoFactorChallengeValidator,
  twoFactorChallengeVerificationValidator,
  twoFactorAccountRecoveryValidator
} from '#app/http/validators/v1/auth/two_factor_validator'


@inject()
export default class AuthController {
  public static readonly VERSION = 'v1'
  
  constructor(
    private readonly authService: BasicAuthService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly socialAuthService: SocialAuthService
  ) {}

  /**
   * @register
   * @responseBody 201 - { "message": "Verification email sent", "data": { "user": <User>, "token": } }
   */
  public async register({ request, response }: HttpContext) {
    const registrationData = await request.validateUsing(registerValidator)

    const user = await this.authService.register(registrationData)

    emitter.emit('registered', {
      version: AuthController.VERSION,
      method: 'internal',
      user,
    })

    const profile = router.makeUrl(AuthController.VERSION + ".users.show", {
      username: user.username 
    });

    response.header('Location', profile).created({
      message: 'Verification email sent!',
      data: {
        user,
        token: await user.createToken()
      },
    })
  }

  /**
   * @login
   * @responseBody 200 - { message: <string>, data: { token: } }
   */
  public async login({ request }: HttpContext) {
    const token = await this.authService.attempt({
      ...(await request.validateUsing(loginValidator)),
      ip: request.ip(),
    })

    return {
      message: 'Logged in successfully!',
      data: { token },
    }
  }

  /**
   * @logout
   * @responseBody 200 - { message: <string> }
   */
  public async logout({ auth }: HttpContext) {
    await auth.logout()
    return 'Logged out successfully!'
  }

  /**
   * @verifyEmail
   * @responseBody 200
   */
  public async verifyEmail({ request }) {
    const { id, token } = await request.validateUsing(emailVerificationValidator)
    await this.authService.verifyEmail(id, token)
    return 'Email verified successfully!'  
  }


  public async resendEmailVerification({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(resendEmailVerificationValidator)
    await this.authService.sendVerificationMail(email)
    response.accepted('Verification link sent to email!')
  }

  public async forgotPassword({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    await this.authService.forgotPassword(email)
    response.accepted('Password reset link sent to your email!')
  }

  public async resetPassword({ request }: HttpContext) {
    const { id, token, password } = await request.validateUsing(resetPasswordValidator)
    const user = await User.findOrFail(id)
    await this.authService.resetPassword(user, token, password)
    await new PasswordChangedMail(user).sendLater()
    return 'Password changed successfully!'
  }


  /**
   * @twoFactorChallenge
   * @responseBody 200 - { message: string }
   */
  public async sendTwoFactorChallenge({ request }) {
    const { email, token } = await request.validateUsing(twoFactorChallengeValidator)
    const user = await User.findByOrFail('email', email)
    
    await Token.verify('two_factor_auth_challenge', user.id, token)
    await this.twoFactorAuthService.challenge(user)
    
    return 'Challenge sent!'
  }
  
  public async verifyTwoFactorChallenge({ request }: HttpContext) {
    const { email, token, challengeToken } = await request.validateUsing(twoFactorChallengeVerificationValidator)
    const user = await User.findByOrFail('email', email)

    const authToken = await this.twoFactorAuthService.verify(user, challengeToken)
    await Token.verify('two_factor_auth_challenge_verification', user.id, token)

    return {
      message: 'Challenge completed!',
      data: { token: authToken },
    }
  }

  /**
   * @generateRecoveryCodes
   * @responseBody 200 - { data: string[] }
   */
  public generateRecoveryCodes({ auth }: AuthenticRequest) {
    return this.twoFactorAuthService.generateRecoveryCodes(auth.user!)
  }

  public async recoverTwoFactorAccount({ request }: HttpContext) {
    const { email, code } = await request.validateUsing(twoFactorAccountRecoveryValidator)
    const token = await this.twoFactorAuthService.recover(email, code)

    return {
      message: 'Account recovered successfully!',
      data: { token },
    }
  }

  public async loginWithSocialAuthToken({ request, response, params, ally }: HttpContext) {
    let { email, username, token: oauthToken } = await request.validateUsing(socialAuthTokenLoginValidator)

    const data: SocialAuthData = await ally.use(params.provider).userFromToken(oauthToken)

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
    
    emitter.emit('registered', {
      version: AuthController.VERSION,
      method: 'social',
      user,
    })
      
    const profile = router.makeUrl(AuthController.VERSION + ".users.show", {
      username: user.username 
    });
    
    response.header('Location', profile).created({
      message: 'Registered successfully!',
      data: { user, token },
    })
  }
}
