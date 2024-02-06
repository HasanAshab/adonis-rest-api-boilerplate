import JsonResource from './json_resource'
import { SimplePaginator } from '@adonisjs/lucid/build/src/Database/Paginator/SimplePaginator'

export default abstract class ResourceCollection {
  protected shouldWrap = true
  protected abstract collects: typeof JsonResource
  protected collection!: this['collects'][]

  constructor(protected readonly resources: Array<Record<string, any>>) {}

  public static make(resources: Array<Record<string, any>>) {
    if (this === ResourceCollection) {
      throw new Error('Cannot create an instance of an abstract class.')
    }

    return new (this as any)(resources)
  }
  
  public dontWrap() {
    this.shouldWrap = false;
    return this;
  }
  
  public isPaginated(): this is this & { resources: SimplePaginator } {
    return this.resources instanceof SimplePaginator
  }

  public toJSON() {
    if (this.isPaginated()) {
      this.setCollection(this.resources.rows)
      return { 
        meta: this.resources.serialize().meta,
        ...this.serialize()
      }
    }
    this.setCollection(this.resources)
    return this.serialize()
  }

  protected serialize() {
    return this.shouldWrap || this.isPaginated()
      ? {
        [this.collects.wrap]: this.collection
      }
      : this.collection
  }

  protected setCollection(collection: Array<Record<string, any>>) {
    return this.collection = collection.map(resource => {
      return this.collects.make(resource).dontWrap()
    })
  }
}
