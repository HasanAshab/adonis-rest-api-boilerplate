import { BaseMailer } from "@adonisjs/mail";
import { Message } from "@adonisjs/mail";

export default class PasswordChangedMail extends BaseMailer {
  constructor(private user: User) {
    super()
  }

  public prepare(message: Message) {
    message
      .subject('Your Password Was Changed!')
      .to(this.user.email)
      .htmlView('emails/password_changed')
  }
}
