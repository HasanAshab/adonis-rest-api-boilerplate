import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Config from '@ioc:Adonis/Core/Config';
import Client from './Client';

export default class ClientProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.bind('Adonis/Addons/Client', () => {
      const Client = require('./Client').default;
      return new Client(Config.get('client'));
    });
  }
}