import JsonResource from './json_resource.js'
import { SimplePaginator } from '@adonisjs/lucid/database'

export default class ResourceCollection<Item extends JsonResource> {
  protected shouldWrap = true
  protected collects: constructor<Item> = JsonResource
  protected collection!: Item[]

  constructor(protected readonly resources: Array<Record<string, any>>) {}

  static make(resources: Array<Record<string, any>>) {
    return new this(resources)
  }

  dontWrap() {
    this.shouldWrap = false
    return this
  }

  toJSON() {
    if (this.resources instanceof SimplePaginator) {
      this.setCollection((this.resources as any).rows)
      return {
        meta: this.resources.toJSON().meta,
        ...this.serialize(),
      }
    }
    this.setCollection(this.resources)
    return this.serialize()
  }

  protected serialize() {
    return this.shouldWrap || this.resources instanceof SimplePaginator
      ? {
          [this.collects.wrap]: this.collection,
        }
      : this.collection
  }

  protected setCollection(collection: Array<Record<string, any>>) {
    this.collection = collection.map((resource) => this.collects.make(resource).dontWrap())
  }
}
