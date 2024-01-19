import Assertor from './Assertor';
import Mail, { BaseMailer } from '@ioc:Adonis/Addons/Mail'

import expect from 'expect';
import { isEqual } from 'lodash';


type FakeMailer = ReturnType < Mail['fake'] >;

export class MailAssertor extends Assertor {
  public fakeMailer?: FakeEmitter;

  public fake(...args: Parameters<Mail['fake']>) {
    return this.fakeMailer = Mail.fake(...args);
  }

  private assertFaked(): asserts this is this & { fakeMailer: FakeEmitter } {
    if (!this.fakeMailer) {
      throw new Error('Mail not faked. \nUse fake() before asserting mails.');
    }
  }

  public isDispatched(eventName: string, data?: object) {
    this.assertFaked();
    return this.fakeMailer.exists(event => {
      if (event.name !== eventName) {
        return false;
      }
      trace(event.data.user, data.user)
      if (data && !isEqual(event.data, data)) {
        return false;
      }
      return true;
    });
  }

  public assertSent(mailer: BaseMailer) {
    this.assert(() => {
      console.log(mailer)
      this.fakeMailer.exists(mail => {
      })
      expect(this.isDispatched(...args)).toBe(true);
    });
  }

  public assertNotDispatched(eventName: string) {
    this.assert(() => {
      expect(this.isDispatched(eventName)).toBe(false);
    });
  }

  public assertNothingSent() {
    this.assert(() => {
      expect(this.fakeMailer.events).toHaveLength(0)
    })
  }

}

export default new MailAssertor;