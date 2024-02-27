//import JsonResource from '@samer/api-resource/resources/json_resource'
import ListNotificationTypeResource from '#app/http/resources/v1/notification_type/list_notification_type_resource'
import { groupBy } from 'lodash'

export default class NotificationTypeCollection extends ResourceCollection {
  protected collects = ListNotificationTypeResource

  public serialize() {
    return {
      data: groupBy(this.collection, 'resource.groupName')
    }
  }
}
