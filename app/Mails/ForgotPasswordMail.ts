import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'

export default class ForgotPasswordMail extends BaseMailer {
  constructor (private user: User, private url: string) {
    super();
  }
  
  public prepare(message: MessageContract) {
    message
      .subject('Your Password Was Changed!' + this.url)
      .from("test@example.com")
      .to(this.user.email);
  }
}
