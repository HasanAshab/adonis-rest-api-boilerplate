import type { HttpContext } from '@adonisjs/core/http'
import NotificationCollection from '#app/Http/Resources/v1/notification/NotificationCollection'
import ShowNotificationResource from '#app/Http/Resources/v1/notification/ShowNotificationResource'


export default class NotificationsController {
  public async index({ auth, request }: HttpContext) {
    const notifications = await auth
      .user!.related('notifications')
      .query()
      .select('id', 'createdAt', 'readAt')
      .paginateUsing(request)

    return NotificationCollection.make(notifications)
  }

  public async show({ params, auth }: HttpContext) {
    const notification = await auth.user!.related('notifications').query().findOrFail(params.id)
    return ShowNotificationResource.make(notification)
  }

  public async markAllAsRead({ auth }: HttpContext) {
    await auth.user!.markNotificationsAsRead()
    return 'All notifications marked as read'
  }

  public async markAsRead({ params, auth }: HttpContext) {
    await auth.user!.markNotificationAsRead(params.id)
    return 'Notification marked as read'
  }

  public async unreadCount({ auth }: HttpContext) {
    const count = await auth.user!.unreadNotifications().getCount()
    return { data: { count } }
  }

  public async delete({ response, params, auth }: HttpContext) {
    await auth.user!.related('notifications').query().whereUid(params.id).deleteOrFail()
    response.noContent()
  }
}
