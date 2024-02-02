import type { Request } from '~/core/express'
import JsonResource from '@samer/api-resource/resources/json_resource'
import { NotificationDocument } from '~/app/models/Notification'

export default abstract class ShowNotificationResource extends JsonResource<NotificationDocument> {
  serialize() {
    return {
      id: this.resource._id,
      type: this.resource.type,
      data: this.resource.data,
      unread: this.resource.readAt === null,
      readAt: this.resource.readAt,
      createdAt: toHumanReadableFormat(this.resource.createdAt),
    }
  }
}
