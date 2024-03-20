import ResourceCollection from './resource_collection.js'
import JsonResource from './json_resource.js'

export default class AnonymousResourceCollection extends ResourceCollection<JsonResource> {
  constructor(
    protected readonly resources: Array<Record<string, any>>,
    protected collects: typeof JsonResource
  ) {
    super(resources)
  }
}
