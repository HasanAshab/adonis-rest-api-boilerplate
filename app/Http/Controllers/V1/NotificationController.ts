import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import type { INotification } from "~/app/models/Notification";
import Notification from "~/app/models/Notification";
import ListNotificationResource from "~/app/http/resources/v1/notification/ListNotificationResource";
import ShowNotificationResource from "~/app/http/resources/v1/notification/ShowNotificationResource";

export default class NotificationController {

  public async index({ auth }: HttpContextContract) {
    return await auth.user.related('notifications').paginateCursor(req)

    return ListNotificationResource.collection(
      await auth.user.notifications.paginateCursor(req)
    );
  }
  
  async show({}, notification: Notification) {
    return ShowNotificationResource.make(notification);
  }
  

  async markAsRead(req: AuthenticRequest, id: string) {
    await req.user.unreadNotifications.where("_id").equals(id).markAsReadOrFail();
    return 'Notification marked as read';
  }
  

  async unreadCount(req: AuthenticRequest) {
    return {
      data: await req.user.unreadNotifications.count()
    };
  }
  

  async delete(req: AuthenticRequest, res: Response, id: string) {
    await req.user.notifications.where("_id").equals(id).deleteOneOrFail();
    res.sendStatus(204);
  }
}

