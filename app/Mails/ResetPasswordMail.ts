import Client from '@ioc:Adonis/Addons/Client'
import Token, { SignTokenOptions } from '#app/Models/Token'
import { BaseMailer } from "@adonisjs/mail";
import { Message } from "@adonisjs/mail";

export default class ResetPasswordMail extends BaseMailer {
  private tokenOptions: SignTokenOptions = {
    oneTimeOnly: true,
    expiresIn: '3 days'
  }

  constructor(private user: User) {
    super()
  }

  public async prepare(message: Message) {
    const url = this.resetUrl(await this.resetToken())

    message
      .subject('Your Password Was Changed!')
      .from('test@example.com')
      .to(this.user.email)
      .htmlView('emails/reset_password', { url })
  }

  public resetUrl(token: string) {
    return Client.makeUrl('password.reset', {
      id: this.user.id,
      token,
    })
  }

  public resetToken() {
    return Token.sign('password_reset', this.user.id, this.tokenOptions)
  }
}
