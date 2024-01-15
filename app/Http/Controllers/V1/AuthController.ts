import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { inject } from '@adonisjs/fold';
import { bind } from '@adonisjs/route-model-binding'
import Route from '@ioc:Adonis/Core/Route';
import Event from '@ioc:Adonis/Core/Event';
import User from 'App/Models/User';
import BasicAuthService from 'App/Services/Auth/BasicAuthService';
import TwoFactorAuthService from "App/Services/Auth/TwoFactorAuthService";
import PasswordChangedMail from "App/Mails/PasswordChangedMail";
import RegisterValidator from 'App/Http/Validators/V1/Auth/RegisterValidator';
import LoginValidator from 'App/Http/Validators/V1/Auth/Login/LoginValidator';
import ForgotPasswordValidator from 'App/Http/Validators/V1/Auth/Password/ForgotPasswordValidator';
import ResetPasswordValidator from 'App/Http/Validators/V1/Auth/Password/ResetPasswordValidator';
import SetupTwoFactorAuthValidator from 'App/Http/Validators/V1/Auth/SetupTwoFactorAuthValidator';
import AccountRecoveryValidator from 'App/Http/Validators/V1/Auth/AccountRecoveryValidator';


@inject()
export default class AuthController {
	//constructor(private authService: AuthService, private socialAuthService: SocialAuthService) {}
	constructor(
	  private readonly authService: BasicAuthService,
	  private readonly twoFactorAuthService: TwoFactorAuthService
	) {}

	public async register({ request, response }: HttpContextContract) {
		const registrationData = await request.validate(RegisterValidator);
    
    const user = await this.authService.register(registrationData);

		Event.emit('registered', {
			version: 'v1',
			method: 'internal',
			user,
		});
		//Event.fire(new Registered({}))

		const profileUrl = ''; //Route.makeUrl("v1_users.show", [user.username]);

		response.header('Location', profileUrl).created({
			message: 'Verification email sent!',
			data: {
			  token: await user.createToken(),
			  user
			}
		});
	}

	public async login({ request }: HttpContextContract) {
		const token = await this.authService.attempt({
			...await request.validate(LoginValidator),
			ip: request.ip()
		});

		return {
			message: 'Logged in successfully!',
			data: { token }
		}
	}
	
	public async logout({ auth }: HttpContextContract) {
    await auth.logout();
		return 'Logged out successfully!';
	}
  
  public async forgotPassword({ request, response }: HttpContextContract) {
		const { email, redirectUrl } = await request.validate(ForgotPasswordValidator);
		await this.authService.sendResetPasswordNotification(email, redirectUrl);
		response.accepted('Password reset link sent to your email!');
	}

  @bind()
	public async resetPassword({ request }: HttpContextContract, user: User) {
		const { password, token } = await request.validate(ResetPasswordValidator);
		await this.authService.resetPassword(user, token, password);
		await new PasswordChangedMail(user).sendLater();
		return 'Password changed successfully!';
	}

  public async setupTwoFactorAuth({ request, auth }: HttpContextContract) {
    const { enable = true, method } = await request.validate(SetupTwoFactorAuthValidator);
   
    if(!enable) {
      await this.twoFactorAuthService.disable(auth.user!);
      return "Two Factor Auth disabled!";
    }
    
    return {
      message: "Two Factor Auth enabled!",
      data: await this.twoFactorAuthService.enable(auth.user!, method)
    };
  }
  
  @bind()
  public async sendOtp({}, user: User) {
    await this.twoFactorAuthService.sendOtp(user);
    return "6 digit OTP code sent to phone number!";
  }
  
  public generateRecoveryCodes({ auth }: AuthenticRequest) {
    return this.twoFactorAuthService.generateRecoveryCodes(auth.user!);
  }
  
  public async recoverAccount({ request }: HttpContextContract) {
    const { email, code } = await request.validate(AccountRecoveryValidator);
    const token = await this.twoFactorAuthService.recover(email, code);
    
    return {
      message: "Account recovered successfully!",
      data: { token }
    }
  }

	/* 
  redirectToSocialLoginProvider({ params, ally }: HttpContextContract) {
    return ally.use(params.provider).stateless().redirect();
  }
  
  async loginWithSocialProvider({ params, ally }: HttpContextContract) {
    const externalUser = await ally.use(params.provider).user();
    console.log(externalUser)
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
