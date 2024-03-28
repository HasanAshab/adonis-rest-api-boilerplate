import BaseJsonResource from '#resources/base_json_resource'

export default class ListNotificationTypeResource extends BaseJsonResource {
  serialize() {
    return {
      ...this.resource.$attributes,
      links: {
        self: this.makeUrl('v1.notificationTypes.show'),
      },
    }
  }
}
