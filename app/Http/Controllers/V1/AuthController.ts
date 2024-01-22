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

import EmailAndUsernameSetupRequiredException from 'App/Exceptions/EmailAndUsernameSetupRequiredException';
import UsernameSetupRequiredException from 'App/Exceptions/UsernameSetupRequiredException';
import EmailSetupRequiredException from 'App/Exceptions/EmailSetupRequiredException';


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
ya29.a0AfB_byDAdXmhyCHY5fyblwsY5Uu_IijvY5WwbH1rJnyzYCoDt_zSu85hkd8w9y-1GOK-ckDJSVgONYhJ1zH9ItqNtWUF2lsPQpqBnp-7DNCZMJ1Yi8zYTinGE-6IS40kvFt7NPBAyMQOTyt9I2iquuLeuV-VwJQnaE1-aCgYKAXgSARISFQHGX2MiYR7lLiS8ChJ2rfiTcsM1gw0171
    facebook:
EAACZBwjX8c54BOZCrAF6xYcpYT6a5emzzCKUF0DlVq2geDe7bd4zkGqGoB0w6CrzdcrSdLaZCtaTy8Y5ZC5OgpyvbTvjGK8QJnK4jNkq1CaLb8qp8PJNZCTJMLexjE5RzzLgx5K0ROybkOdfJbitgSVsuzckfIE9viiXgI9bRHq95BXgCJPTqBg0POWtyfL6pvRxhiAU7yEyAxsWgXWIZAdW9PntApt37wvQn4KH0sMrJsz1gHt3h6
*/
  public async loginWithSocialAuthToken({ params, ally, request }: HttpContextContract) {
    let { token, email, username } = await request.validate(SocialAuthTokenLoginValidator)

    const socialInfo = await ally.use(params.provider).userFromToken(token);
    
    email = email ?? socialInfo.email;
    username = username ?? email?.split('@')[0];
    
    const user = await User.updateOrCreate(
      {
        socialProvider: params.provider,
        socialId: socialInfo.id
      },
      {
        name: socialInfo.nickName.substring(0, 35),
        socialAvatar: socialInfo.avatarUrl
      }
    );
    
    if(!(user.email || user.username) && socialInfo.email) {
      const existingUser = await User.query()
        .where('email', socialInfo.email)
        .orWhere('username', username)
        .select('email', 'username')
        .first();
        
      const emailExists = existingUser?.email === socialInfo.email;
      const usernameExists = existingUser?.username === username; 
      
      if(emailExists && usernameExists) {
        throw new EmailAndUsernameSetupRequiredException();
      }

      if(emailExists) {
        throw new EmailSetupRequiredException();
      }
      
      user.email = socialInfo.email;
      user.verified = socialInfo.emailVerificationState === 'verified';
      
      if(!usernameExists) {
        user.username = username;
      }

      await user.save();
      
      if(usernameExists) {
        throw new UsernameSetupRequiredException();
      }
    }
    
    if(!user.email && !user.username) {
      throw new EmailAndUsernameSetupRequiredException();
    }

    if(!user.email) {
      throw new EmailSetupRequiredException();
    }
    
    if(!user.username) {
      throw new UsernameSetupRequiredException();
    }
    
    return {
			message: 'Logged in successfully!',
			data: {
			  token: await user.createToken(),
			  user
			}
		}
  }
  
  
  public async setupSocialAccountWithAuthToken({ params, ally, request }: HttpContextContract) {
    const { token, email, username } = await request.validate(SocialAuthTokenLoginValidator)

    const socialInfo = await ally.use(params.provider).userFromToken(token);

    await User.query()
      .where(socialProvider, params.provider)
      .where(socialId, socialInfo.id)
      .update({
        email,
        username
      });
      
    return 'Account'
  }
  
  
  
  redirectToSocialLoginProvider({ params, ally }: HttpContextContract) {
    return ally.use(params.provider).stateless().redirect();
  }
  
  async loginWithSocialProvider({ request, params, ally }: HttpContextContract) {

    const externalUser = await ally.use(params.provider).user();
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
}
