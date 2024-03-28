import { ResourceCollection } from 'adonis-api-resource'
import ListNotificationTypeResource from '#resources/v1/notification_type/list_notification_type_resource'
import { groupBy } from 'lodash-es'

export default class NotificationTypeCollection extends ResourceCollection<typeof ListNotificationTypeResource> {
  protected collects = ListNotificationTypeResource

  serialize() {
    return {
      data: groupBy(this.collection, 'resource.groupName'),
    }
  }
}
