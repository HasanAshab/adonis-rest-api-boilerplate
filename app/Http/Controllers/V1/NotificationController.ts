import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type { INotification } from '~/app/models/Notification'
import Notification from '~/app/models/Notification'
import ListNotificationResource from '~/app/http/resources/v1/notification/ListNotificationResource'
import ShowNotificationResource from '~/app/http/resources/v1/notification/ShowNotificationResource'

export default class NotificationController {
  public async index({ auth, request }: HttpContextContract) {
    const notifications = await auth.user!.related('notifications').query().paginateUsing(request)
    return ListNotificationResource.collection(notifications)
  }

  public async show({ params, auth }: HttpContextContract) {
    const notification = await auth
      .user!.related('notification')
      .query()
      .where('id', params.id)
      .first()
    return ShowNotificationResource.make(notification)
  }

  public async markAsRead({ params, auth }: HttpContextContract) {
    await auth.user!.related('notifications').query().where('id', params.id).markAsReadOrFail()
    return 'Notification marked as read'
  }

  public async unreadCount({ auth }: HttpContextContract) {
    return await auth.user!.related('notifications').query().whereNull('readAt').getCount()
  }

  public async delete({ response, params, auth }: HttpContextContract) {
    await auth.user!.related('notifications').query().where('id', params.id).deleteOrFail()
    response.noContent()
  }
}
