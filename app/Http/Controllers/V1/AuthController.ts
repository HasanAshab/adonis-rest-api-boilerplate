import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event'
import { inject } from "@adonisjs/fold"
import AuthService from "App/Services/Auth/AuthService";
import RegisterValidator from "App/Http/Validators/V1/Auth/RegisterValidator";

@inject()
export default class AuthController {
  constructor(private authService: AuthService) {}
  
  async register({ request, response }: HttpContextContract) {
    const { email, username, password } = await request.validate(RegisterValidator);
    const user = await this.authService.register(email, username, password, request.file("profile"));
    
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
    return ally.use(params.provider).redirect();
  }
  
}
