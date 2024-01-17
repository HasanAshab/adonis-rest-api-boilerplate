import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import Route from '@ioc:Adonis/Core/Route';

export default class EmailVerificationMail extends BaseMailer {
  constructor (private user: User, private version: string) {
    super();
  }
  
  public async prepare(message: MessageContract) {
    message
      .subject('Verify Email Address!')
      .to(this.user.email)
      .htmlView('emails/verification', { 
        url: await this.verificationUrl()
      });
  }
  
  public async verificationUrl() {
    return await Route.makeSignedUrl(this.version + '.verify', [this.user.id], {
      expiresIn: '30m'
    });
  }
}
