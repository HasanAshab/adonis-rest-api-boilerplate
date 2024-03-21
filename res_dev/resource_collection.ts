import JsonResource from './json_resource.js'
import { SimplePaginator } from '@adonisjs/lucid/database'

export default class ResourceCollection<Item extends JsonResource> {
  protected shouldWrap = true
  protected collects: constructor<Item> = JsonResource
  protected collection!: Item[]

  constructor(protected readonly resources: Array<Record<string, any>>, ..._: any[]) {}

  static make<T extends typeof ResourceCollection<JsonResource>>(this: T, ...args: ConstructorParameters<T>) {
    return new this(...args)
  }

  dontWrap() {
    this.shouldWrap = false
    return this
  }

  protected makeResource(resource: Record<string, any>) {
    return this.collects.make(resource)
  }
  
  protected serialize() {
    return this.shouldWrap || this.resources instanceof SimplePaginator
      ? {
          [this.collects.wrap]: this.collection,
        }
      : this.collection
  }

  protected makeCollection(resources: Array<Record<string, any>>) {
    this.collection = resources.map(resource => 
      this.makeResource(resource).dontWrap()
    )
  }
  
  
  toJSON() {
    if (this.resources instanceof SimplePaginator) {
      this.makeCollection((this.resources as any).rows)
      return {
        meta: this.resources.toJSON().meta,
        ...this.serialize(),
      }
    }
    this.makeCollection(this.resources)
    return this.serialize()
  }

}
