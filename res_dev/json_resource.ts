import AnonymousResourceCollection from './anonymous_resource_collection.js'
import router from '@adonisjs/core/services/router'

export default class JsonResource {
  public static wrap = 'data'
  protected shouldWrap = true

  constructor(protected readonly resource: Record<string, any>) {}

  public static make(resource: Record<string, any>) {
    return new this(resource)
  }

  public static collection(resources: Array<Record<string, any>>) {
    return new AnonymousResourceCollection(resources, this)
  }

  public dontWrap() {
    this.shouldWrap = false
    return this
  }

  public serialize() {
    return this.resource.toJSON?.() ?? this.resource
  }

  public toJSON() {
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
