import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'

export default class NewUserJoinedMail extends BaseMailer {
  constructor (private user: User, private newUser: User) {
    super();
  }
  
  public prepare(message: MessageContract) {
    message
      .subject('Verify Email Address!')
      .to(this.user.email)
      .htmlView('emails/new_user_joined', { user: this.newUser });
  }
}
