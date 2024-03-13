import { BaseMail } from "@adonisjs/mail";
import client from '#ioc/client'
import Token, { SignTokenOptions } from '#models/token'
import User from '#models/user'


export default class EmailVerificationMail extends BaseMail {
  public subject = 'Verify Email Address!'

  private tokenOptions: SignTokenOptions = {
    oneTimeOnly: true,
    expiresIn: '3 days'
  }
  
  constructor(private recipient: User) {
    super()
  }

  public async prepare() {
    const url = this.verificationUrl(await this.verificationToken())
    this.message
      .to(this.recipient.email)
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
