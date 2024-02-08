//import ResourceCollection from '@samer/api-resource/resources/resource_collection'
import ListNotificationResource from 'App/Http/Resources/v1/notification/ListNotificationResource'
import { groupBy } from 'lodash'

export default class NotificationCollection extends ResourceCollection {
  protected collects = ListNotificationResource

  public serialize() {
    return {
      data: groupBy(this.collection, (listNotificationResource) => {
        return listNotificationResource.resource.createdAt.startOf('day').toRelative()
      }),
    }
  }
}
