import ResourceCollection from './resource_collection.js'
import type { JsonResource } from './json_resource.js'

export default class AnonymousResourceCollection extends ResourceCollection {
  constructor(
    protected readonly resources: Array<Record<string, any>>,
    protected collects: InstanceType<JsonResource>
  ) {
    super(resources)
  }
}
