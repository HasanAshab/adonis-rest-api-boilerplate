import Assertor from './Assertor';
import Mail from '@ioc:Adonis/Addons/Mail'
import expect from 'expect';

type FakeMailer = ReturnType < Mail['fake'] >;

export class MailAssertor extends Assertor {
  private fakeMailer?: FakeEmitter;
  
  private assertFaked(): asserts this is this & { fakeMailer: FakeEmitter } {
    if (!this.fakeMailer) {
      throw new Error('Mail not faked. \nUse fake() before asserting mails.');
    }
  }

  public fake(...args: Parameters<Mail['fake']>) {
    return this.fakeMailer = Mail.fake(...args);
  }

  public isSentTo(email: string) {
    this.assertFaked();
    return this.fakeMailer.exists(mail => {
      return !!mail.to.find(recipient => {
        return recipient.address === email;
      });
    });
  }
  
  public assertExists(...args: Parameters<FakeMailer['exists']>) {
    this.assertTrue(this.fakeMailer.exists(...args));
  }
  
  public assertNotExists(...args: Parameters<FakeMailer['exists']>) {
    this.assertFalse(this.fakeMailer.exists(...args));
  }

  public assertSentTo(email: string) {
    this.assertTrue(this.isSentTo(email));
  }
  
  public assertNotSentTo(email: string) {
    this.assertFalse(this.isSentTo(email));
  }

  public assertNothingSent() {
    this.assertFalse(this.fakeMailer.exists(() => true));
  }
}

export default new MailAssertor;