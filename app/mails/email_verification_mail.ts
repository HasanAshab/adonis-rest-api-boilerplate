import { BaseMail } from '@adonisjs/mail'
import client from '#ioc/client'
import Token, { SignTokenOptions } from '#models/token'
import User from '#models/user'

export default class EmailVerificationMail extends BaseMail {
  subject = 'Verify Email Address!'

  private tokenOptions: SignTokenOptions = {
    oneTimeOnly: true,
    expiresIn: '3 days',
  }

  constructor(private recipient: User) {
    super()
  }

  async prepare() {
    const url = this.verificationUrl(await this.verificationToken())
    this.message.to(this.recipient.email).htmlView('emails/verification', { url })
  }

  verificationUrl(token: string) {
    return client.makeUrl('verify', {
      id: this.recipient.id,
      token,
    })
  }

  verificationToken() {
    return Token.sign('verification', this.recipient.id, this.tokenOptions)
  }
}
