import { JsonResource } from 'adonis-api-resource'

export default class ListNotificationTypeResource extends JsonResource {
  serialize() {
    return {
      ...this.resource.$attributes,
      links: {
        self: this.makeUrl('v1.notificationTypes.show'),
      },
    }
  }
}
