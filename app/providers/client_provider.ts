import { ApplicationService } from "@adonisjs/core/types";


declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    client: typeof import('#app/services/client')
  }
}


export default class ClientProvider {
  constructor(protected app: ApplicationService) {}

  public register() {
    this.app.container.singleton('client', async () => {
      const { default: Client } = await import('#app/services/client')
      const config = this.app.config.get('client')
      return new Client(config)
    })
  }
}
