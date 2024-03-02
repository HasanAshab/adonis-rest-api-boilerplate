import { ApplicationService } from "@adonisjs/core/types";


declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    twilio: typeof import('#app/services/twilio')
  }
}

export default class TwilioProvider {
  constructor(protected app: ApplicationService) {}

  public register() {
    this.app.container.singleton('twilio', async () => {
      const { default: Twilio } = await import('#app/services/twilio')
      const config = this.app.config.get('twilio')
      return new Twilio(config)
    })
  }
}
