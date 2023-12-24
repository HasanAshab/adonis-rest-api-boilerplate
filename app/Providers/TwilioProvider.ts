import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Config from '@ioc:Adonis/Core/Config'
import { Twilio } from "twilio";

export default class TwilioProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    const { sid, authToken } = Config.get("twilio");
    this.app.container.singleton("Adonis/Addons/Twilio", () => {
      return new Twilio(sid, authToken);
    });
  }
}
