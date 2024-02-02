import JsonResource from './json_resource'
import { SimplePaginator } from '@adonisjs/lucid/build/src/Database/Paginator/SimplePaginator'

export default abstract class ResourceCollection {
  protected abstract collects: typeof JsonResource
  protected collection!: Record<string, any>[]

  constructor(protected readonly resources: Array<Record<string, any>>) {}

  public static make(resources: Array<Record<string, any>>) {
    if (this === ResourceCollection) {
      throw new Error('Cannot create an instance of an abstract class.')
    }

    return new (this as any)(resources)
  }

  public toJSON() {
    if (this.resources instanceof SimplePaginator) {
      this.resources.rows = this.serializeCollection(this.resources.rows)
      return this.resources.toJSON()
    }
    this.collection = this.serializeCollection(this.resources)
    return this.serialize()
  }

  public serialize() {
    return { [this.collects.wrap]: this.collection }
  }

  protected serializeCollection(collection: Array<Record<string, any>>) {
    return collection.map((resource) => {
      return this.collects.make(resource).serialize()
    })
  }
}
