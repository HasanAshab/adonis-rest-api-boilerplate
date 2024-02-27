import type ClientContract from './Client.js'

declare module '@ioc:Adonis/Addons/Client' {
  const Client: ClientContract
  export default Client

  interface ClientConfig {
    baseUrl: string
  }
}

declare module '@ioc:Adonis/Core/Response' {
  interface ResponseContract {
    redirectToClient(name: string, data?: Record<string, any>): ReturnType<this['redirect']>
    redirectToClientPath(path: string): ReturnType<this['redirect']>
  }
}
