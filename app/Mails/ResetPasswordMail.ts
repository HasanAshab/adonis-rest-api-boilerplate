import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import { DateTime } from 'luxon'
import Client from '@ioc:Adonis/Addons/Client'
import Token from 'App/Models/Token'

export default class ResetPasswordMail extends BaseMailer {
  private readonly TOKEN_LIFESPAN = 3 // days

  constructor(private user: User) {
    super()
  }

  public async prepare(message: MessageContract) {
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

  public async resetToken() {
    const { secret } = await Token.create({
      key: this.user.id,
      type: 'password_reset',
      oneTime: true,
      expiresAt: DateTime.local().plus({ days: this.TOKEN_LIFESPAN }),
    })
    return secret
  }
}
