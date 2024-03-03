//import JsonResource from '@samer/api-resource/resources/json_resource'

export default class ListNotificationTypeResource extends JsonResource {
  public serialize() {
    return {
      ...this.resource.$attributes,
      links: {
        self: this.makeUrl('v1.notificationTypes.show')
      }
    }
  }
}
