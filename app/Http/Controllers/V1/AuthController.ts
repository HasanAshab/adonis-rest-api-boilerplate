import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inject } from "@adonisjs/fold"
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import AuthService from "App/Services/Auth/AuthService";
import RegisterValidator from "App/Http/Validators/V1/Auth/RegisterValidator";
import LoginValidator from "App/Http/Validators/V1/Auth/LoginValidator";


@inject()
export default class AuthController {
  //constructor(private authService: AuthService, private socialAuthService: SocialAuthService) {}
  constructor(private readonly authService: AuthService) {}
  
  async register({ request, response }: HttpContextContract) {
    const userData = await request.validate(RegisterValidator);
    userData.profile = request.file('profile');
    
    const user = await User.create(userData);
    await user.createDefaultSettings();

    Event.emit("user:registered", {
      version: "v1",
      method: "internal",
      user
    });

    const profileUrl = Route.makeUrl("v1_users.show", [user.username]);
    
    response.header("Location", profileUrl).created({
      message: "Verification email sent!",
      token: user.createToken(),
      data: { user }
    });
  }
  
  async login({ request, response }: HttpContextContract) {
    const { email, password, otp } = await request.validate(LoginValidator);
    const token = await this.authService.login(email, password, otp);
    return {
      message: "Logged in successfully!",
      token
    }
  }
  
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
 
}
