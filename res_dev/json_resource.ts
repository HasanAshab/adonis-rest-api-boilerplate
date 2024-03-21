import AnonymousResourceCollection from './anonymous_resource_collection.js'
import router from '@adonisjs/core/services/router'


export default class JsonResource {
  static wrap = 'data'
  protected shouldWrap = true

  constructor(protected readonly resource: Record<string, any>) {}

  static make<T extends typeof JsonResource>(this: T, ...args: ConstructorParameters<T>) {
    return new this(...args)
  }

  static collection(resources: Array<Record<string, any>>) {
    return new AnonymousResourceCollection(resources, this)
  }

  dontWrap() {
    this.shouldWrap = false
    return this
  }

  serialize() {
    return this.resource.toJSON?.() ?? this.resource
  }

  toJSON() {
    return this.shouldWrap
      ? {
          [this.constructor.wrap]: this.serialize(),
        }
      : this.serialize()
  }

  protected when(condition: boolean, value: unknown | (() => unknown)) {
    if (!condition) return
    return typeof value === 'function' ? value() : value
  }

  protected makeUrl(name: string) {
    return router.makeUrl(name, this.resource)
  }
}
