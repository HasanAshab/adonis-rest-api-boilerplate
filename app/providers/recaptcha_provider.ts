import { ApplicationService } from '@adonisjs/core/types'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    recaptcha: InstanceType<typeof import('#services/recaptcha').default>
  }
}

export default class RecaptchaProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('recaptcha', async () => {
      const { default: Recaptcha } = await import('#services/recaptcha')
      const config = this.app.config.get('recaptcha')
      return new Recaptcha(config)
    })
  }
}
