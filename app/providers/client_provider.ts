import { ApplicationService } from '@adonisjs/core/types'
import { ClientConfig } from '#interfaces/client'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    client: InstanceType<typeof import('#services/client').default>
  }
}

export default class ClientProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('client', async () => {
      const { default: Client } = await import('#services/client')
      const config = this.app.config.get<ClientConfig>('client')
      return new Client(config)
    })
  }
}
