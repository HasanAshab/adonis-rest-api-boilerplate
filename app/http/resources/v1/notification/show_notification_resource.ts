import { JsonResource } from 'adonis-api-resource'

export default abstract class ShowNotificationResource extends JsonResource {
  serialize() {
    return {
      id: this.resource.id,
      data: this.resource.data,
      isRead: !!this.resource.readAt,
      readAt: this.resource.readAt?.toRelative(),
      createdAt: this.resource.createdAt.toRelative(),
      links: {
        markAsRead: this.makeUrl('v1.notifications.markAsRead'),
        delete: this.makeUrl('v1.notifications.delete'),
      },
    }
  }
}
