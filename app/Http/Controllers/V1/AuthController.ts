import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import { inject } from "@adonisjs/fold"
import AuthService from "App/Services/Auth/AuthService";
import RegisterValidator from "App/Http/Validators/V1/Auth/RegisterValidator";

import User, { UserDocument } from "App/Models/User";


@inject()
export default class AuthController {
  //constructor(private authService: AuthService, private socialAuthService: SocialAuthService) {}
  constructor(private authService: AuthService) {}
  
  async register({ request, response, auth }: HttpContextContract) {
    const { email, username, password } = await request.validate(RegisterValidator);
    const user = await this.authService.register(email, username, password, request.file("profile"));
    console.log(user)
    
    Event.emit("user:registered", {
      version: "v1",
      method: "internal",
      user
    });
    
    const profileUrl = Route.makeUrl("v1_users.show", [user.username]);
    
    response.header("Location", profileUrl).created({
      token: user.createToken(),
      data: { user },
      //expiration: Date.now() + Config.get("jwt.expiration"),
      message: "Verification email sent!"
    });
  }
  
  redirectToSocialLoginProvider({ params, ally }: HttpContextContract) {
    return ally.use(params.provider).stateless().redirect();
  }
  
  async loginWithSocialProvider({ params, ally }: HttpContextContract) {
    const externalUser = await ally.use(params.provider).user();

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
