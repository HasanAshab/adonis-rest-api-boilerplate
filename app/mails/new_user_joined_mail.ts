import { BaseMail } from '@adonisjs/mail'
import User from '#models/user'

export default class NewUserJoinedMail extends BaseMail {
  subject = 'New User Joined!'

  constructor(
    private recipient: User,
    private newUser: User
  ) {
    super()
  }

  prepare() {
    this.message.to(this.recipient.email).htmlView('emails/new_user_joined', { user: this.newUser })
  }
}
