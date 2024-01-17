import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import Route from '@ioc:Adonis/Core/Route';

export default class EmailVerificationMail extends BaseMailer {
  constructor (private user: User, version: string) {
    super();
  }
  
  public async prepare(message: MessageContract) {
    message
      .subject('Verify Email Address!')
      .to(this.user.email)
      .htmlView('verification', { 
        url: await this.verificationUrl()
      });
  }
  
  public verificationUrl() {
    return Route.makeSignedUrl(this.version + '.verify');
  }
}
