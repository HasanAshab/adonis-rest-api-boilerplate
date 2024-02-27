//import JsonResource from '@samer/api-resource/resources/json_resource'
import ListNotificationTypeResource from '#app/Http/Resources/v1/NotificationType/ListNotificationTypeResource'
import { groupBy } from 'lodash'

export default class NotificationTypeCollection extends ResourceCollection {
  protected collects = ListNotificationTypeResource

  public serialize() {
    return {
      data: groupBy(this.collection, 'resource.groupName')
    }
  }
}
