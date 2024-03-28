import { JsonResource } from 'adonis-api-resource'
import router from '@adonisjs/core/services/router'

export default class BaseJsonResource<Resource> extends JsonResource<Resource> {
  protected makeUrl(name: string) {
    return router.makeUrl(name, this.resource)
  }
}