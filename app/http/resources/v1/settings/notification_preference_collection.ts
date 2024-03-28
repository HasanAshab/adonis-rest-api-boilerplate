import { JsonResource } from 'adonis-api-resource'
import { groupBy } from 'lodash-es'

export default class NotificationPreferenceCollection extends ResourceCollection {
  serialize() {
    return {
      data: groupBy(this.collection, 'resource.groupName'),
    }
  }
}
