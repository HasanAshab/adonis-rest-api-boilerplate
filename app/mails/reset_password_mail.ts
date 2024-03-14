import client from '#ioc/client'
import { BaseMail } from "@adonisjs/mail";
import User from '#models/user'
import Token, { SignTokenOptions } from '#models/token'

export default class ResetPasswordMail extends BaseMail {
  public subject = 'Please Reset Your Password'

  private tokenOptions: SignTokenOptions = {
    oneTimeOnly: true,
    expiresIn: '3 days'
  }

  constructor(private recipient: User) {
    super()
  }

  public async prepare(message: Message) {
    const url = this.resetUrl(await this.resetToken())

    this.message
      .to(this.recipient.email)
      .htmlView('emails/reset_password', { url })
  }

  public resetUrl(token: string) {
    return client.makeUrl('password.reset', {
      id: this.recipient.id,
      token,
    })
  }

  public resetToken() {
    return Token.sign('password_reset', this.recipient.id, this.tokenOptions)
  }
}
