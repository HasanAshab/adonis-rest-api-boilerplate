import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Token from "App/Models/Token"

export default class AuthController {
  async register({ request }: HttpContextContract) {
    console.log(Token.where)
    return await Token.find()
  }
}
