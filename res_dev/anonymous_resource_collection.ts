import ResourceCollection from './resource_collection'
import type { JsonResource } from './json_resource'

export default class AnonymousResourceCollection extends ResourceCollection {
  constructor(
    protected readonly resources: Array<Record<string, any>>,
    protected collects: InstanceType<JsonResource>
  ) {
    super(resources)
  }
}
