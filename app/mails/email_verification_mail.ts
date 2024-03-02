import client from '#ioc/client'
import Token, { SignTokenOptions } from '#app/models/token'
import { BaseMailer } from "@adonisjs/mail";
import { Message } from "@adonisjs/mail";

export default class EmailVerificationMail extends BaseMailer {
  private tokenOptions: SignTokenOptions = {
    oneTimeOnly: true,
    expiresIn: '3 days'
  }
  
  constructor(private user: User) {
    super()
  }

  public async prepare(message: Message) {
    const url = this.verificationUrl(await this.verificationToken())
    message
      .subject('Verify Email Address!')
      .to(this.user.email)
      .htmlView('emails/verification', { url })
  }

  public verificationUrl(token: string) {
    return client.makeUrl('verify', {
      id: this.user.id,
      token
    })
  }
  
  public verificationToken() {
    return Token.sign('verification', this.user.id, this.tokenOptions)
  }
}
