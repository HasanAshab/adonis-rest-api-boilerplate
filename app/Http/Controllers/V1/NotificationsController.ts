import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotificationService from 'App/Services/NotificationService'
import NotificationCollection from 'App/Http/Resources/v1/notification/NotificationCollection'
import ShowNotificationResource from 'App/Http/Resources/v1/notification/ShowNotificationResource'


export default class NotificationsController {
  constructor(private readonly notificationService = new NotificationService) {}

  public async index({ auth, request }: HttpContextContract) {
    const notifications = await auth
      .user!.related('notifications')
      .query()
      .select('id', 'createdAt', 'readAt')
      .paginateUsing(request)

    return NotificationCollection.make(notifications)
  }

  public async show({ params, auth }: HttpContextContract) {
    const notification = await auth.user!.related('notifications').query().findOrFail(params.id)
    return ShowNotificationResource.make(notification)
  }

  public async markAllAsRead({ params, auth }: HttpContextContract) {
    await this.notificationService.markAsRead(auth.user)
    return 'All notifications marked as read'
  }

  public async markAsRead({ params, auth }: HttpContextContract) {
    await this.notificationService.markAsRead(auth.user, params.id)
    return 'Notification marked as read'
  }

  public async unreadCount({ auth }: HttpContextContract) {
    const count = await this.notificationService.unread(auth.user!).getCount()
    return { data: { count } }
  }

  public async delete({ response, params, auth }: HttpContextContract) {
    await auth.user!.related('notifications').query().whereUid(params.id).deleteOrFail()
    response.noContent()
  }
}
