import JsonResource from './json_resource'
import { SimplePaginator } from '@adonisjs/lucid/build/src/Database/Paginator/SimplePaginator'

export default abstract class ResourceCollection {
  protected abstract collects: typeof JsonResource
  protected collection!: this['collects'][]

  constructor(protected readonly resources: Array<Record<string, any>>) {}

  public static make(resources: Array<Record<string, any>>) {
    if (this === ResourceCollection) {
      throw new Error('Cannot create an instance of an abstract class.')
    }

    return new (this as any)(resources)
  }

  public toJSON() {
    if (this.resources instanceof SimplePaginator) {
      this.setCollection(this.resources.rows)
      return { 
        meta: this.resources.serialize().meta,
        ...this.serialize()
      }
    }
    this.setCollection(this.resources)
    return this.serialize()
  }

  public serialize() {
    return { [this.collects.wrap]: this.collection }
  }

  protected setCollection(collection: Array<Record<string, any>>) {
    return this.collection = collection.map(resource => this.collects.make(resource))
  }
}
