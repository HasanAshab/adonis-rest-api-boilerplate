import { ApplicationService } from "@adonisjs/core/types";
import Twilio from '#app/services/twilio'


export default class TwilioProvider {
  constructor(protected app: ApplicationService) {}

  public register() {
    this.app.container.singleton(Twilio, () => {
      const config = this.app.config.get('twilio')
      return new Twilio(config)
    })
  }
}
