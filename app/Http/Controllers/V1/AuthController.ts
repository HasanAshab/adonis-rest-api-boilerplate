import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inject } from "@adonisjs/fold"
import AuthService from "App/Services/Auth/AuthService";
import RegisterValidator from "App/Http/Validators/V1/Auth/RegisterValidator";

@inject()
export default class AuthController {
  constructor(private authService: AuthService) {}
  
  async register({ request }: HttpContextContract) {
    return request.validate(RegisterValidator);
    const { email, username, password } = request.validate(RegisterValidator);
    
  }
  
}
