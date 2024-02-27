import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import emitter from '@adonisjs/core/services/emitter'
import User from '#app/Models/User'
import Token from '#app/Models/Token'
import BasicAuthService from '#app/Services/Auth/BasicAuthService'
import TwoFactorAuthService from '#app/Services/Auth/TwoFactor/TwoFactorAuthService'
import SocialAuthService, { SocialAuthData } from '#app/Services/Auth/SocialAuthService'
import OtpService from '#app/Services/OtpService'
import PasswordChangedMail from '#app/Mails/PasswordChangedMail'
import RegisterValidator from '#app/Http/Validators/V1/Auth/RegisterValidator'
import LoginValidator from '#app/Http/Validators/V1/Auth/Login/LoginValidator'
import EmailVerificationValidator from '#app/Http/Validators/V1/Auth/Email/EmailVerificationValidator'
import ResendEmailVerificationValidator from '#app/Http/Validators/V1/Auth/Email/ResendEmailVerificationValidator'
import ForgotPasswordValidator from '#app/Http/Validators/V1/Auth/Password/ForgotPasswordValidator'
import ResetPasswordValidator from '#app/Http/Validators/V1/Auth/Password/ResetPasswordValidator'
import TwoFactorChallengeValidator from '#app/Http/Validators/V1/Auth/TwoFactor/TwoFactorChallengeValidator'
import TwoFactorChallengeVerificationValidator from '#app/Http/Validators/V1/Auth/TwoFactor/TwoFactorChallengeVerificationValidator'
import TwoFactorAccountRecoveryValidator from '#app/Http/Validators/V1/Auth/TwoFactor/TwoFactorAccountRecoveryValidator'
import SocialAuthTokenLoginValidator from '#app/Http/Validators/V1/Auth/Login/SocialAuthTokenLoginValidator'



export default class AuthController {
  public static readonly VERSION = 'v1'
  
  // TODO
  constructor(
    private readonly authService = new BasicAuthService(),
    private readonly twoFactorAuthService = new TwoFactorAuthService(),
    private readonly socialAuthService = new SocialAuthService()
  ) {}

  /**
   * @register
   * @responseBody 201 - { "message": "Verification email sent", "data": { "user": <User>, "token": } }
   */
  public async register({ request, response }: HttpContext) {
    const registrationData = await request.validate(RegisterValidator)

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
      ...(await request.validate(LoginValidator)),
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
    const { id, token } = await request.validate(EmailVerificationValidator)
    await this.authService.verifyEmail(id, token)
    return 'Email verified successfully!'  
  }


  public async resendEmailVerification({ request, response }: HttpContext) {
    const { email } = await request.validate(ResendEmailVerificationValidator)
    await this.authService.sendVerificationMail(email)
    response.accepted('Verification link sent to email!')
  }

  public async forgotPassword({ request, response }: HttpContext) {
    const { email } = await request.validate(ForgotPasswordValidator)
    await this.authService.forgotPassword(email)
    response.accepted('Password reset link sent to your email!')
  }

  public async resetPassword({ request }: HttpContext) {
    const { id, token, password } = await request.validate(ResetPasswordValidator)
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
    const { email, token } = await request.validate(TwoFactorChallengeValidator)
    const user = await User.findByOrFail('email', email)
    
    await Token.verify('two_factor_auth_challenge', user.id, token)
    await this.twoFactorAuthService.challenge(user)
    
    return 'Challenge sent!'
  }
  
  public async verifyTwoFactorChallenge({ request }: HttpContext) {
    const { email, token, challengeToken } = await request.validate(TwoFactorChallengeVerificationValidator)
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
    const { email, code } = await request.validate(TwoFactorAccountRecoveryValidator)
    const token = await this.twoFactorAuthService.recover(email, code)

    return {
      message: 'Account recovered successfully!',
      data: { token },
    }
  }

  public async loginWithSocialAuthToken({ request, response, params, ally }: HttpContext) {
    let { email, username, token: oauthToken } = await request.validate(SocialAuthTokenLoginValidator)

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
