import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import emitter from '@adonisjs/core/services/emitter'
import User from '#models/user'
import Token from '#models/token'
import AuthService from '#services/auth/auth_service'
import TwoFactorAuthService from '#services/auth/two_factor/two_factor_auth_service'
import SocialAuthService, { SocialAuthData } from '#services/auth/social_auth_service'
import OtpService from '#services/otp_service'
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


export default class AuthController {
  public static readonly VERSION = 'v1'
  
  /**
   * @register
   * @responseBody 201 - { "message": "Verification email sent", "data": { "user": <User>, "token": } }
   */
  public async register({ request, response }: HttpContext) {
    const registrationData = await request.validateUsing(registerValidator)

    const user = await AuthService.register(registrationData)

    emitter.emit('registered', {
      version: AuthController.VERSION,
      method: 'internal',
      user,
    })

    /*const profileUrl = router.makeUrl(AuthController.VERSION + ".users.show", {
      username: user.username 
    });*/

    response
   //   .header('Location', profileUrl)
      .created({
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
    const token = await AuthService.attempt({
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
    await AuthService.verifyEmail(id, token)
    return 'Email verified successfully!'  
  }


  public async resendEmailVerification({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(resendEmailVerificationValidator)
    await AuthService.sendVerificationMail(email)
    response.accepted('Verification link sent to email!')
  }

  public async forgotPassword({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    await AuthService.forgotPassword(email)
    response.accepted('Password reset link sent to your email!')
  }

  public async resetPassword({ request }: HttpContext) {
    const { id, token, password } = await request.validateUsing(resetPasswordValidator)
    const user = await User.findOrFail(id)
    await AuthService.resetPassword(user, token, password)
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
    await TwoFactorAuthService.challenge(user)
    
    return 'Challenge sent!'
  }
  
  public async verifyTwoFactorChallenge({ request }: HttpContext) {
    const { email, token, challengeToken } = await request.validateUsing(twoFactorChallengeVerificationValidator)
    const user = await User.findByOrFail('email', email)

    const authToken = await TwoFactorAuthService.verify(user, challengeToken)
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
    return TwoFactorAuthService.generateRecoveryCodes(auth.user!)
  }

  public async recoverTwoFactorAccount({ request }: HttpContext) {
    const { email, code } = await request.validateUsing(twoFactorAccountRecoveryValidator)
    const token = await TwoFactorAuthService.recover(email, code)

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

    const { user, isRegisteredNow } = await SocialAuthService.sync(params.provider, data)
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
