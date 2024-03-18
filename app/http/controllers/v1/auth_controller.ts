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
import { emailVerificationValidator, resendEmailVerificationValidator } from '#validators/v1/auth/email_validator'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/v1/auth/password_validator'
import { 
  twoFactorChallengeValidator,
  twoFactorChallengeVerificationValidator,
  twoFactorAccountRecoveryValidator
} from '#validators/v1/auth/two_factor_validator'
import AuthService from '#services/auth/auth_service'
import SocialAuthService, { SocialAuthData } from '#services/auth/social_auth_service'


@inject()
export default class AuthController {
  public static readonly VERSION = 'v1'
  
  constructor(
    private readonly authService: AuthService
    private readonly socialAuthService: SocialAuthService
  ) {}
  
  /**
   * @register
   * @responseBody 201 - { "message": "Verification email sent", "data": { "user": <User>, "token": } }
   */
  public async register({ request, response }: HttpContext) {
    const registrationData = await request.validateUsing(registerValidator)
    const user = await this.authService.register(registrationData)
   
    Registered.dispatch(user, 'internal', AuthController.VERSION)

    /*const profileUrl = router.makeUrl(AuthController.VERSION + ".users.show", {
      username: user.username 
    });*/

    response
   //   .header('Location', profileUrl)
      .created({
        message: 'Verification email sent!',
        data: user
      })
  }

  /**
   * @login
   * @responseBody 200 - { message: <string>, data: { token: } }
   */
  public async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    
    const token = await this.authService.attempt({
      email,
      password,
      ip: request.ip(),
      device: request.device()
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
    await this.authService.logout(auth.user)
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
    await mail.sendLater(new PasswordChangedMail(user))
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
    await TwoFactorthis.authService.challenge(user)
    
    return 'Challenge sent!'
  }
  
  public async verifyTwoFactorChallenge({ request }: HttpContext) {
    const { email, token, challengeToken, trustDevice } = await request.validateUsing(twoFactorChallengeVerificationValidator)
    const user = await User.findByOrFail('email', email)
    
    const accessToken = await TwoFactorthis.authService.verify(user, challengeToken, trustDevice && request.device.id)
    await Token.verify('two_factor_auth_challenge_verification', user.id, token)

    return {
      message: 'Challenge completed!',
      data: { token: accessToken },
    }
  }

  /**
   * @generateRecoveryCodes
   * @responseBody 200 - { data: string[] }
   */
  public generateRecoveryCodes({ auth }: AuthenticRequest) {
    return TwoFactorthis.authService.generateRecoveryCodes(auth.user!)
  }

  public async recoverTwoFactorAccount({ request }: HttpContext) {
    const { email, code } = await request.validateUsing(twoFactorAccountRecoveryValidator)
    const token = await TwoFactorthis.authService.recover(email, code)

    return {
      message: 'Account recovered successfully!',
      data: { token },
    }
  }

  public async loginWithSocialAuthToken({ request, response, params, ally }: HttpContext) {
    let { email, username, token: socialToken } = await request.validateUsing(socialAuthTokenLoginValidator)

    const data: SocialAuthData = await ally.use(params.provider).userFromToken(socialToken)

    data.username = username
    if (email) {
      data.email = email
      data.emailVerificationState = 'unverified'
    }

    const { user, isRegisteredNow } = await this.socialthis.authService.sync(params.provider, data)
    const token = await user.createToken()

    if (!isRegisteredNow) {
      return {
        message: 'Logged in successfully!',
        data: { token, user },
      }
    }
    
    Registered.dispatch(user, 'social', AuthController.VERSION)
/*
    const profileUrl = router.makeUrl(AuthController.VERSION + ".users.show", {
      username: user.username 
    })
*/
    response
     // .header('Location', profileUrl)
      .created({
        message: 'Registered successfully!',
        data: { user, token },
      })
  }
}
