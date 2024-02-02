import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class CacheProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Adonis/Addons/Cache', () => {
      const CacheManager = require('./CacheManager').default
      return new CacheManager()
    })
  }
}
