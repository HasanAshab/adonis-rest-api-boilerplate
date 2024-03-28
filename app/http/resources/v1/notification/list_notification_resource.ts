import BaseJsonResource from '#resources/base_json_resource'

export default class ListNotificationResource extends BaseJsonResource {
  serialize() {
    return {
      id: this.resource.id,
      isRead: !!this.resource.readAt,
      createdAt: this.resource.createdAt.toRelative(),
      links: {
        self: this.makeUrl('v1.notifications.show'),
        markAsRead: this.makeUrl('v1.notifications.markAsRead'),
        delete: this.makeUrl('v1.notifications.delete'),
      },
    }
  }
}
