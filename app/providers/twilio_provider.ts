import { ApplicationService } from '@adonisjs/core/types'
import { TwilioConfig } from '#interfaces/twilio'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    twilio: import('#services/twilio').default
  }
}

export default class TwilioProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('twilio', async () => {
      const { default: Twilio } = await import('#services/twilio')
      const config = this.app.config.get<TwilioConfig>('twilio')
      return new Twilio(config)
    })
  }
}
