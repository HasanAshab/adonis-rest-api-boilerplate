import config from '@adonisjs/core/services/config'
import Client from './client.js'
import { ApplicationService } from "@adonisjs/core/types";

export default class ClientProvider {
  constructor(protected app: ApplicationService) {}

  private registerClientAddon() {
    this.app.container.singleton('Adonis/Addons/Client', () => {
      const Client = require('./Client').default
      return new Client(config.get('client'))
    })
  }

  private extendHttpResponse() {
    const Response = this.app.container.use('Adonis/Core/Response')
    const Client = this.app.container.use('Adonis/Addons/Client')

    Response.macro('redirectToClient', function (name: string, data?: Record<string, any>) {
      return this.redirect(Client.makeUrl(name, data))
    })

    Response.macro('redirectToClientPath', function (path: string) {
      return this.redirect(Client.url(path))
    })
  }

  public register() {
    this.registerClientAddon()
  }

  public boot() {
    this.extendHttpResponse()
  }
}
