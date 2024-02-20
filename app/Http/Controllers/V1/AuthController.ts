import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { bind } from '@adonisjs/route-model-binding'
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import User from 'App/Models/User'
import BasicAuthService from 'App/Services/Auth/BasicAuthService'
import TwoFactorAuthService from 'App/Services/Auth/TwoFactor/TwoFactorAuthService'
import SocialAuthService, { SocialAuthData } from 'App/Services/Auth/SocialAuthService'
import OtpService from 'App/Services/OtpService'
import PasswordChangedMail from 'App/Mails/PasswordChangedMail'
import RegisterValidator from 'App/Http/Validators/V1/Auth/RegisterValidator'
import LoginValidator from 'App/Http/Validators/V1/Auth/Login/LoginValidator'
import EmailVerificationValidator from 'App/Http/Validators/V1/Auth/Email/EmailVerificationValidator'
import ResendEmailVerificationValidator from 'App/Http/Validators/V1/Auth/Email/ResendEmailVerificationValidator'
import ForgotPasswordValidator from 'App/Http/Validators/V1/Auth/Password/ForgotPasswordValidator'
import ResetPasswordValidator from 'App/Http/Validators/V1/Auth/Password/ResetPasswordValidator'
import TwoFactorChallengeValidator from 'App/Http/Validators/V1/Auth/TwoFactor/TwoFactorChallengeValidator'
import TwoFactorChallengeVerificationValidator from 'App/Http/Validators/V1/Auth/TwoFactor/TwoFactorChallengeVerificationValidator'
import TwoFactorAccountRecoveryValidator from 'App/Http/Validators/V1/Auth/TwoFactor/TwoFactorAccountRecoveryValidator'
import SocialAuthTokenLoginValidator from 'App/Http/Validators/V1/Auth/Login/SocialAuthTokenLoginValidator'



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
  public async register({ request, response }: HttpContextContract) {
    const registrationData = await request.validate(RegisterValidator)

    const user = await this.authService.register(registrationData)

    Event.emit('registered', {
      version: AuthController.VERSION,
      method: 'internal',
      user,
    })

    const profile = Route.makeUrl(AuthController.VERSION + ".users.show", {
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
  public async login({ request }: HttpContextContract) {
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
  public async logout({ auth }: HttpContextContract) {
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


  public async resendEmailVerification({ request, response }: HttpContextContract) {
    const { email } = await request.validate(ResendEmailVerificationValidator)
    await this.authService.sendVerificationMail(email)
    response.accepted('Verification link sent to email!')
  }

  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email } = await request.validate(ForgotPasswordValidator)
    await this.authService.forgotPassword(email)
    response.accepted('Password reset link sent to your email!')
  }

  public async resetPassword({ request }: HttpContextContract) {
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
  @bind()
  public async twoFactorChallenge({ request }) {
    const { email, token } = await request.validate(TwoFactorChallengeValidator)
    const user = await User.findByOrFail('email', email)
    
    await Token.verify('two_factor_auth_challenge', user.id, token)
    await this.twoFactorAuthService.challenge(user)
    
    return 'Challenge sent!'
  }
  
  public async verifyTwoFactorChallenge() {
    const { email, token: challengeToken } = await request.validate(TwoFactorChallengeVerificationValidator)
    const token = await this.twoFactorAuthService.verify(email, challengeToken)
    
    return {
      message: 'Challenge completed!',
      data: { token },
    }
  }

  /**
   * @generateRecoveryCodes
   * @responseBody 200 - { data: string[] }
   */
  public generateRecoveryCodes({ auth }: AuthenticRequest) {
    return this.twoFactorAuthService.generateRecoveryCodes(auth.user!)
  }

  public async recoverTwoFactorAccount({ request }: HttpContextContract) {
    const { email, code } = await request.validate(TwoFactorAccountRecoveryValidator)
    const token = await this.twoFactorAuthService.recover(email, code)

    return {
      message: 'Account recovered successfully!',
      data: { token },
    }
  }

  public async loginWithSocialAuthToken({ request, response, params, ally }: HttpContextContract) {
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
    
    Event.emit('registered', {
      version: AuthController.VERSION,
      method: 'social',
      user,
    })
      
    const profile = Route.makeUrl(AuthController.VERSION + ".users.show", {
      username: user.username 
    });
    
    response.header('Location', profile).created({
      message: 'Registered successfully!',
      data: { user, token },
    })
  }
}
