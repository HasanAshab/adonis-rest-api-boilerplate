import Controller from "~/app/http/controllers/Controller";
import { RequestHandler } from "~/core/decorators";
import { AuthenticRequest, Response } from "~/core/express";
import type { INotification } from "~/app/models/Notification";
import Notification from "~/app/models/Notification";
import ListNotificationResource from "~/app/http/resources/v1/notification/ListNotificationResource";
import ShowNotificationResource from "~/app/http/resources/v1/notification/ShowNotificationResource";

export default class NotificationController extends Controller {
  @RequestHandler
  async index(req: AuthenticRequest) {
    return ListNotificationResource.collection(
      await req.user.notifications.paginateCursor(req)
    );
  }
  
  @RequestHandler
  async show(rawNotification: INotification) {
    return ShowNotificationResource.make(rawNotification);
  }
  
  @RequestHandler
  async markAsRead(req: AuthenticRequest, id: string) {
    await req.user.unreadNotifications.where("_id").equals(id).markAsReadOrFail();
    return 'Notification marked as read';
  }
  
  @RequestHandler
  async unreadCount(req: AuthenticRequest) {
    return {
      data: await req.user.unreadNotifications.count()
    };
  }
  
  @RequestHandler
  async delete(req: AuthenticRequest, res: Response, id: string) {
    await req.user.notifications.where("_id").equals(id).deleteOneOrFail();
    res.sendStatus(204);
  }
}

