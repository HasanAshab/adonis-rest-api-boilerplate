import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import { DateTime } from 'luxon'
import Client from '@ioc:Adonis/Addons/Client'
import Token from 'App/Models/Token'


export default class EmailVerificationMail extends BaseMailer {
  private readonly TOKEN_LIFESPAN = 3 // days

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
  
  public async verificationToken() {
    const { secret } = await Token.create({
      key: this.user.id,
      type: 'verification',
      oneTime: true,
      expiresAt: DateTime.local().plus({ days: this.TOKEN_LIFESPAN }),
    })
    return secret
  }
}
