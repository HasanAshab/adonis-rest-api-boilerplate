import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { bind } from '@adonisjs/route-model-binding'
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import User from 'App/Models/User'
import BasicAuthService from 'App/Services/Auth/BasicAuthService'
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService'
import SocialAuthService, { SocialAuthData } from 'App/Services/Auth/SocialAuthService'
import OtpService from 'App/Services/OtpService'
import PasswordChangedMail from 'App/Mails/PasswordChangedMail'
import RegisterValidator from 'App/Http/Validators/V1/Auth/RegisterValidator'
import LoginValidator from 'App/Http/Validators/V1/Auth/Login/LoginValidator'
import EmailVerificationValidator from 'App/Http/Validators/V1/Auth/Email/EmailVerificationValidator'
import ResendEmailVerificationValidator from 'App/Http/Validators/V1/Auth/Email/ResendEmailVerificationValidator'
import ForgotPasswordValidator from 'App/Http/Validators/V1/Auth/Password/ForgotPasswordValidator'
import ResetPasswordValidator from 'App/Http/Validators/V1/Auth/Password/ResetPasswordValidator'
import SetupTwoFactorAuthValidator from 'App/Http/Validators/V1/Auth/SetupTwoFactorAuthValidator'
import AccountRecoveryValidator from 'App/Http/Validators/V1/Auth/AccountRecoveryValidator'
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
    //Event.fire(new Registered({}))

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

  public async setupTwoFactorAuth({ request, auth }: HttpContextContract) {
    const { enable = true, method } = await request.validate(SetupTwoFactorAuthValidator)

    if (!enable) {
      await this.twoFactorAuthService.disable(auth.user!)
      return 'Two Factor Auth disabled!'
    }

    return {
      message: 'Two Factor Auth enabled!',
      data: await this.twoFactorAuthService.enable(auth.user!, method),
    }
  }

  /**
   * @sendOtp
   * @responseBody 200 - { message: string }
   */
  //Todo
  @bind()
  public async twoFactorChallenge(_, user: User, otpService = new OtpService) {
    if (!user.phoneNumber || user.twoFactorMethod === 'app') {
      return
    }
    
    if(user.twoFactorMethod === 'sms') {
      await otpService.sendThroughSMS(user.phoneNumber)
    } 
    
    else if(user.twoFactorMethod === 'sms') {
      await otpService.sendThroughCall(user.phoneNumber)
    }
    return 'Verification code sent to your phone number!'
  }

  /**
   * @generateRecoveryCodes
   * @responseBody 200 - { data: string[] }
   */
  public generateRecoveryCodes({ auth }: AuthenticRequest) {
    return this.twoFactorAuthService.generateRecoveryCodes(auth.user!)
  }

  public async recoverTwoFactorAccount({ request }: HttpContextContract) {
    const { email, code } = await request.validate(AccountRecoveryValidator)
    const token = await this.twoFactorAuthService.recover(email, code)

    return {
      message: 'Account recovered successfully!',
      data: { token },
    }
  }

  public async loginWithSocialAuthToken({ request, response, params, ally }: HttpContextContract) {
    let { token, email, username } = await request.validate(SocialAuthTokenLoginValidator)

    const data: SocialAuthData = await ally.use(params.provider).userFromToken(token)

    data.username = username
    if (email) {
      data.email = email
      data.emailVerificationState = 'unverified'
    }

    const { user, isRegisteredNow } = await this.socialAuthService.sync(params.provider, data)
    const token = await user.createToken(),

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
