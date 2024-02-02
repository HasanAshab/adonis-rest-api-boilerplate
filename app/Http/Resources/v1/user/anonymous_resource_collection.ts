import ResourceCollection from './resource_collection'
import JsonResource from './json_resource'

export default class AnonymousResourceCollection extends ResourceCollection {
  constructor(
    protected readonly resources: Array<Record<string, any>>,
    protected collects: typeof JsonResource
  ) {
    super(resources)
  }
}
