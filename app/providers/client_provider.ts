import { ApplicationService } from "@adonisjs/core/types";


declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    client: InstanceType<typeof import('#services/client').default>
  }
}


export default class ClientProvider {
  constructor(protected app: ApplicationService) {}

  public register() {
    this.app.container.singleton('client', async () => {
      const { default: Client } = await import('#services/client')
      const config = this.app.config.get('client')
      return new Client(config)
    })
  }
}
