import { BaseMail } from '@adonisjs/mail'
import User from '#models/user'

export default class PasswordChangedMail extends BaseMail {
  subject = 'Your Password Was Changed!'

  constructor(private recipient: User) {
    super()
  }

  prepare() {
    this.message.to(this.recipient.email).htmlView('emails/password_changed')
  }
}
