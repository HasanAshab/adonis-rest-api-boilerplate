import client from '#ioc/client'
import { BaseMail } from '@adonisjs/mail'
import User from '#models/user'
import Token, { SignTokenOptions } from '#models/token'

export default class ResetPasswordMail extends BaseMail {
  subject = 'Please Reset Your Password'

  private tokenOptions: SignTokenOptions = {
    oneTimeOnly: true,
    expiresIn: '3 days',
  }

  constructor(private recipient: User) {
    super()
  }

  async prepare() {
    const url = this.resetUrl(await this.resetToken())

    this.message.to(this.recipient.email).htmlView('emails/reset_password', { url })
  }

  resetUrl(token: string) {
    return client.makeUrl('password.reset', {
      id: this.recipient.id,
      token,
    })
  }

  resetToken() {
    return Token.sign('password_reset', this.recipient.id, this.tokenOptions)
  }
}
