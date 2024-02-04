import type { Request } from '~/core/express'
//import JsonResource from '@samer/api-resource/resources/json_resource'
import { NotificationDocument } from '~/app/models/Notification'

export default abstract class ShowNotificationResource extends JsonResource<NotificationDocument> {
  serialize() {
    return {
      id: this.resource.id,
      data: this.resource.data,
      isRead: !!this.resource.readAt,
      readAt: this.resource.readAt?.toRelative(),
      createdAt: this.resource.createdAt.toRelative(),
    }
  }
}
