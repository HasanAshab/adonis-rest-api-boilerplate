import type { HttpContext } from '@adonisjs/core/http'
import NotificationCollection from '#resources/v1/notification/notification_collection'
import ShowNotificationResource from '#resources/v1/notification/show_notification_resource'

export default class NotificationsController {
  async index({ auth, request }: HttpContext) {
    const notifications = await auth
      .user!.related('notifications')
      .query()
      .select('id', 'createdAt', 'readAt')
      .paginateUsing(request)

    return NotificationCollection.make(notifications)
  }

  async show({ params, auth }: HttpContext) {
    const notification = await auth.user!.related('notifications').query().findOrFail(params.id)
    return ShowNotificationResource.make(notification)
  }

  async markAllAsRead({ auth }: HttpContext) {
    await auth.user!.markNotificationsAsRead()
    return 'All notifications marked as read'
  }

  async markAsRead({ params, auth }: HttpContext) {
    await auth.user!.markNotificationAsRead(params.id)
    return 'Notification marked as read'
  }

  async unreadCount({ auth }: HttpContext) {
    const count = await auth.user!.unreadNotifications().getCount()
    return { data: { count } }
  }

  async delete({ response, params, auth }: HttpContext) {
    await auth.user!.related('notifications').query().whereUid(params.id).deleteOrFail()

    response.noContent()
  }
}
