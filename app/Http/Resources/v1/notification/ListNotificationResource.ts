import type { Request } from '~/core/express'
import JsonResource from '@samer/api-resource/resources/json_resource'
import { NotificationDocument } from '~/app/models/Notification'

export default abstract class ListNotificationResource extends JsonResource<NotificationDocument> {
  serialize() {
    return {
      id: this.resource._id,
      type: this.resource.type,
      unread: this.resource.readAt === null,
      createdAt: toHumanReadableFormat(this.resource.createdAt),
    }
  }
}
