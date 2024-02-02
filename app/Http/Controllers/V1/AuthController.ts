import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { bind } from '@adonisjs/route-model-binding'
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import User from 'App/Models/User'
import BasicAuthService from 'App/Services/Auth/BasicAuthService'
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService'
import SocialAuthService from 'App/Services/Auth/SocialAuthService'
import PasswordChangedMail from 'App/Mails/PasswordChangedMail'
import RegisterValidator from 'App/Http/Validators/V1/Auth/RegisterValidator'
import LoginValidator from 'App/Http/Validators/V1/Auth/Login/LoginValidator'
import ResendEmailVerificationValidator from 'App/Http/Validators/V1/Auth/ResendEmailVerificationValidator'
import ForgotPasswordValidator from 'App/Http/Validators/V1/Auth/Password/ForgotPasswordValidator'
import ResetPasswordValidator from 'App/Http/Validators/V1/Auth/Password/ResetPasswordValidator'
import SetupTwoFactorAuthValidator from 'App/Http/Validators/V1/Auth/SetupTwoFactorAuthValidator'
import AccountRecoveryValidator from 'App/Http/Validators/V1/Auth/AccountRecoveryValidator'
import SocialAuthTokenLoginValidator from 'App/Http/Validators/V1/Auth/Login/SocialAuthTokenLoginValidator'

export default class AuthController {
  public static readonly VERSION = 'v1'

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

    const profileUrl = '' //Route.makeUrl(AuthController.VERSION + ".users.show", [user.username]);

    response.header('Location', profileUrl).created({
      message: 'Verification email sent!',
      data: {
        token: await user.createToken(),
        user,
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
   * @responseBody 301
   */
  @bind()
  public async verifyEmail({ response }, user: User) {
    await user.markAsVerified()
    //await User.where('id', id).update({ verified: true });
    response.redirectToClient('verify.success')
  }

  async resendEmailVerification({ request }: HttpContextContract) {
    const { email } = await request.validate(ResendEmailVerificationValidator)
    await this.authService.sendVerificationMail(email, AuthController.VERSION)
    return 'Verification link sent to email!'
  }

  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email } = await request.validate(ForgotPasswordValidator)
    await this.authService.sendResetPasswordMail(email)
    response.accepted('Password reset link sent to your email!')
  }

  @bind()
  public async resetPassword({ request }: HttpContextContract, user: User) {
    const { password, token } = await request.validate(ResetPasswordValidator)
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

  @bind()
  public async sendOtp({}, user: User) {
    await this.twoFactorAuthService.sendOtp(user)
    return '6 digit OTP code sent to phone number!'
  }

  public generateRecoveryCodes({ auth }: AuthenticRequest) {
    return this.twoFactorAuthService.generateRecoveryCodes(auth.user!)
  }

  public async recoverAccount({ request }: HttpContextContract) {
    const { email, code } = await request.validate(AccountRecoveryValidator)
    const token = await this.twoFactorAuthService.recover(email, code)

    return {
      message: 'Account recovered successfully!',
      data: { token },
    }
  }

  /* 
  Tokens(haoronaldo): 
    google:
ya29.a0AfB_byAYrekR8lWC8hyclxQh7JxO-h-snsAPivnpH7kftmbkdO9f5iXiPtpHfbhmW2Bq5Ew7e6Brmsnp0iS_OA6YFjRv-q7zQmXrQRCRjIzcEVJvgRjl8DgNKtkjXqDtX8RYtM_nwvLbuYZQT6KkOIgDHXIRdsrUYJu9aCgYKATsSARISFQHGX2MiA8-0rCV4kCd-K73QlmQO6Q0171
facebook:
EAACZBwjX8c54BOZCrAF6xYcpYT6a5emzzCKUF0DlVq2geDe7bd4zkGqGoB0w6CrzdcrSdLaZCtaTy8Y5ZC5OgpyvbTvjGK8QJnK4jNkq1CaLb8qp8PJNZCTJMLexjE5RzzLgx5K0ROybkOdfJbitgSVsuzckfIE9viiXgI9bRHq95BXgCJPTqBg0POWtyfL6pvRxhiAU7yEyAxsWgXWIZAdW9PntApt37wvQn4KH0sMrJsz1gHt3h6
*/
  public async loginWithSocialAuthToken({ params, ally, request }: HttpContextContract) {
    let { token, email, username } = await request.validate(SocialAuthTokenLoginValidator)

    const allyUser = await ally.use(params.provider).userFromToken(token)

    if (email) {
      allyUser.email = email
      allyUser.emailVerificationState = 'unverified'
    }

    const { user, isRegisteredNow } = await this.socialAuthService.upsertUser(
      params.provider,
      allyUser,
      username
    )

    if (isRegisteredNow) {
      Event.emit('registered', {
        version: AuthController.VERSION,
        method: 'social',
        user,
      })
    }

    return {
      message: 'Logged in successfully!',
      data: {
        token: await user.createToken(),
        user,
      },
    }
  }

  /* 
  redirectToSocialLoginProvider({ params, ally }: HttpContextContract) {
    return ally.use(params.provider).stateless().redirect();
  }
  
  async loginWithSocialProvider({ request, params, ally }: HttpContextContract) {

    const externalUser = await ally.use(params.provider).user();
    log(externalUser)
    return externalUser.token.token
    const user = await User.findOneAndUpdate(
      { [`externalId.${params.provider}`]: externalUser.id },
      { 
        name: externalUser.name,
        email: externalUser.email,
        verified: true,
        profile: externalUser.picture
      },
      { new: true }
    );
    
    if(user) {
      return Route.makeClientUrl(`/login/social/${params.provider}/success/${user.createToken()}`);
    }
    
    const fields = externalUser.email ? "username" : "email,username";
    const token = await this.createSocialLoginFinalStepToken(params.provider, externalUser);
    
    return Route.makeClientUrl(`/login/social/${params.provider}/final-step/${externalUser.id}/${token}?fields=${fields}`);
  }
*/
}
