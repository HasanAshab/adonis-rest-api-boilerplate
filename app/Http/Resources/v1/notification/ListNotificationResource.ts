import type { Request } from "~/core/express";
import JsonResource from "~/core/http/resources/JsonResource";
import { NotificationDocument } from "~/app/models/Notification";

export default abstract class ListNotificationResource extends JsonResource<NotificationDocument> {
  toObject(req: Request) {
    return {
      id: this.resource._id,
      type: this.resource.type,
      unread: this.resource.readAt === null,
      createdAt: toHumanReadableFormat(this.resource.createdAt)
    }
  }
}
 