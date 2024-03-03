import { ApplicationService } from "@adonisjs/core/types";
import { HashContract } from "@adonisjs/core/hash";

export default class HashProvider {
  constructor(protected app: ApplicationService) {}

  public boot() {
    const hash = this.app.container.use('hash')
    
    hash.extend('bcrypt-node', async () => {
      const { default: BcryptNodeDriver } = await import('#app/hashing/drivers/bcrypt_node_driver')
      const config = this.app.config.get('hash.list.bcrypt-node')
      return new BcryptNodeDriver(config)
    })
  }
}
