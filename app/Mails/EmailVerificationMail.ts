import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import Client from '@ioc:Adonis/Addons/Client'
import Token, { SignTokenOptions } from 'App/Models/Token'


export default class EmailVerificationMail extends BaseMailer {
  private tokenOptions: SignTokenOptions = {
    oneTimeOnly: true,
    expiresIn: '3 days'
  }
  
  constructor(private user: User) {
    super()
  }

  public async prepare(message: MessageContract) {
    const url = this.verificationUrl(await this.verificationToken())
    message
      .subject('Verify Email Address!')
      .to(this.user.email)
      .htmlView('emails/verification', { url })
  }

  public verificationUrl(token: string) {
    return Client.makeUrl('verify', {
      id: this.user.id,
      token
    })
  }
  
  public verificationToken() {
    return Token.sign('verification', this.user.id, this.tokenOptions)
  }
}
