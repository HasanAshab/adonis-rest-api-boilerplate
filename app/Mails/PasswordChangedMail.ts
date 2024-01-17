import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'

export default class PasswordChangedMail extends BaseMailer {
  constructor (private user: User) {
    super();
  }
  
  public prepare(message: MessageContract) {
    message
      .subject('Your Password Was Changed!')
      .to(this.user.email)
      .htmlView('emails/password_changed');
  }
}
