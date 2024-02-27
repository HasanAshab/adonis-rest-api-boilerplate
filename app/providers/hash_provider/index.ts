import Config from '@ioc:Adonis/Core/Config'
import { ApplicationService } from "@adonisjs/core/types";
import { HashContract } from "@adonisjs/core/hash";

export default class HashProvider {
  private Hash!: HashContract

  constructor(protected app: ApplicationService) {}

  private registerBcryptNodeDriver() {
    this.Hash.extend('bcrypt-node', () => {
      const BcryptNodeDriver = require('./Drivers/BcryptNodeDriver').default
      const config = Config.get('hash.list.bcrypt-node')
      return new BcryptNodeDriver(config)
    })
  }

  public boot() {
    this.Hash = this.app.container.use('Adonis/Core/Hash')
    this.registerBcryptNodeDriver()
  }
}