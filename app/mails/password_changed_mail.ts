import { BaseMail } from "@adonisjs/mail";
import User from '#models/user'

export default class PasswordChangedMail extends BaseMail {
  public subject = 'Your Password Was Changed!'

  constructor(private recipient: User) {
    super()
  }

  public prepare() {
    this.message
      .to(this.recipient.email)
      .htmlView('emails/password_changed')
  }
}
