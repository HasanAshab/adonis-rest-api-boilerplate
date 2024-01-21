import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { bind } from '@adonisjs/route-model-binding'
import Route from '@ioc:Adonis/Core/Route';
import Event from '@ioc:Adonis/Core/Event';
import User from 'App/Models/User';
import BasicAuthService from 'App/Services/Auth/BasicAuthService';
import TwoFactorAuthService from "App/Services/Auth/TwoFactorAuthService";
import PasswordChangedMail from "App/Mails/PasswordChangedMail";
import RegisterValidator from 'App/Http/Validators/V1/Auth/RegisterValidator';
import LoginValidator from 'App/Http/Validators/V1/Auth/Login/LoginValidator';
import ResendEmailVerificationValidator from 'App/Http/Validators/V1/Auth/ResendEmailVerificationValidator';
import ForgotPasswordValidator from 'App/Http/Validators/V1/Auth/Password/ForgotPasswordValidator';
import ResetPasswordValidator from 'App/Http/Validators/V1/Auth/Password/ResetPasswordValidator';
import SetupTwoFactorAuthValidator from 'App/Http/Validators/V1/Auth/SetupTwoFactorAuthValidator';
import AccountRecoveryValidator from 'App/Http/Validators/V1/Auth/AccountRecoveryValidator';
import SocialAuthTokenLoginValidator from 'App/Http/Validators/V1/Auth/Login/SocialAuthTokenLoginValidator';

export default class AuthController {
	//constructor(private authService: AuthService, private socialAuthService: SocialAuthService) {}
	constructor(
	  private readonly authService = new BasicAuthService,
	  private readonly twoFactorAuthService = new TwoFactorAuthService
	) {}
  
  /**
   * @register
   * @responseBody 201 - { "message": "Verification email sent", "data": { "user": <User>, "token": } }
   */
	public async register({ request, response }: HttpContextContract) {
		const registrationData = await request.validate(RegisterValidator);
    
    const user = await this.authService.register(registrationData);

		Event.emit('registered', {
			version: 'v1',
			method: 'internal',
			user,
		});
		//Event.fire(new Registered({}))

		const profileUrl = ''; //Route.makeUrl("v1.users.show", [user.username]);

		response.header('Location', profileUrl).created({
			message: 'Verification email sent!',
			data: {
			  token: await user.createToken(),
			  user
			}
		});
	}

  /**
   * @login
   * @responseBody 200 - { message: <string>, data: { token: } }
   */
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
	 
	/**
   * @logout
   * @responseBody 200 - { message: <string> }
   */
	public async logout({ auth }: HttpContextContract) {
    await auth.logout();
		return 'Logged out successfully!';
	}
	
	/**
   * @verifyEmail
   * @responseBody 301
   */
	@bind()
  public async verifyEmail({ response }, user: User) {
    await user.markAsVerified();
    //await User.where('id', id).update({ verified: true });
    response.redirectToClient('verify.success');
  }

  async resendEmailVerification({ request }: HttpContextContract){
    const { email } = await request.validate(ResendEmailVerificationValidator);
    await this.authService.sendVerificationMail(email, 'v1');
    return "Verification link sent to email!";
  };
  
  public async forgotPassword({ request, response }: HttpContextContract) {
		const { email } = await request.validate(ForgotPasswordValidator);
		await this.authService.sendResetPasswordMail(email);
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
  Tokens(haoronaldo): 
    google:
ya29.a0AfB_byD6BZ7J4bG6PIBM_93T_SBpvHSH_xFMt26Mgk0SGbuP2SbO0GuquY3snwQUKGCApg0JI8_czVWe_qtb6Pe2huFlZMo2TvnoMl_LZJB3o3RGEtEXd6WycpFCShvkLbGUSpSkEWTZZ8Yx7pQ4wUwumXa1UVSFShBhaCgYKAX8SARISFQHGX2MiS9EHkCZzFMu49pI2DCE4Yw0171
    facebook:
EAACZBwjX8c54BO8pp3Dv6vYhERW5XoebXPyS4rjcl597sJLaWnz2HwZAUE23rdMQI5bUXJMMgL5amFFPBd6yPKERuZAw8XWhlZBNPYnegy70QolDPTnp3EqZCGenkOkTZCZC1zGYzpZBw1UfMYtvwc7wNvk0iXfb6Mr3g62lFhsIPw73DJRmYnSL4yB6EQrgZCrf9ebDyu7pqf9wZAXrgRveVzbEqXZBeIZADaKg29TBMuqkOqq5qXUgIpyv
  */
  public async loginWithSocialAuthToken({ params, ally, request }: HttpContextContract) {
    const { token } = await request.validate(SocialAuthTokenLoginValidator)

    const userInfo = await ally.use(params.provider).userFromToken(token);

    try {
      const user = await User.updateOrCreate(
        {
          socialProvider: params.provider,
          socialId: userInfo.id
        },
        {
          email: userInfo.email,
          username: userInfo.email.split('@')[0],
          verified: userInfo.emailVerificationState === 'verified',
          name: userInfo.nickName.substring(0, 35),
  // TODO phoneNumber: userInfo.phoneNumber,
  // TODO profile: userInfo.avatarUrl
        }
      );
    
      return {
  			message: 'Verification email sent!',
  			data: {
  			  token: await user.createToken(),
  			  user
  			}
  		}
    }
    catch(err) {
      log(err)
      if(err.code !== '23505') {
        throw err;
      }
      if(err.constraint === 'users_email_unique') {
        return {
          errors: {
            email: "email already exists"
          }
        }
      }
      
      if(err.constraint === 'users_username_unique') {
        return {
          errors: {
            username: "set username"
          }
        }
      }
    }
  }
  
  
  
  redirectToSocialLoginProvider({ params, ally }: HttpContextContract) {
    return ally.use(params.provider).stateless().redirect();
  }
  
  async loginWithSocialProvider({ request, params, ally }: HttpContextContract) {

    const externalUser = await ally.use(params.provider).user();
        log(externalUser)
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
}
