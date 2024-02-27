import { BaseMailer } from "@adonisjs/mail";
import { Message } from "@adonisjs/mail";

export default class NewUserJoinedMail extends BaseMailer {
  constructor(
    private user: User,
    private newUser: User
  ) {
    super()
  }

  public prepare(message: Message) {
    message
      .subject('Verify Email Address!')
      .to(this.user.email)
      .htmlView('emails/new_user_joined', { user: this.newUser })
  }
}
