import { capitalize } from 'lodash'

type CustomCreator = () => object

export default abstract class Manager {
  private drivers: Record<string, object> = {}
  private customCreators: Record<string, CustomCreator> = {}

  constructor() {
    return new Proxy(this, {
      get: function (target, name) {
        if (target[name] !== undefined) {
          return target[name]
        }
        // Dynamically call the default driver instance
        const driver = target.driver()
        if (typeof driver[name] === 'function') {
          return driver[name].bind(driver)
        }
      },
    })
  }

  defaultDriver(): string | null {
    return null
  }

  driver(name = this.defaultDriver()) {
    if (!name) {
      throw new Error('Failed to resolve driver for ' + this.constructor.name)
    }
    return (this.drivers[name] = this.createDriver(name))
  }

  protected createDriver(driver: string) {
    if (this.customCreators[driver]) return this.customCreators[driver]()
    const method = `create${capitalize(driver)}Driver` as keyof this
    if (typeof this[method] === 'function') return (this[method] as any)()
    throw new Error(`Driver ${driver} not supported.`)
  }

  extend(driver: string, creator: CustomCreator) {
    this.customCreators[driver] = creator
    return this
  }
}
