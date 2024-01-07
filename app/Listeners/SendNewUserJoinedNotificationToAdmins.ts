import type { Listener, EventsList } from '@ioc:Adonis/Core/Event'
import NewUserJoinedNotification from "~/app/notifications/NewUserJoinedNotification";
import Notification from "Notification";
import User from "App/Models/User";

export default class SendNewUserJoinedNotificationToAdmins implements Listener<"registered"> {
  async dispatch({ user }: EventsList["registered"]) {
    const admins = await User.query()
      .where("role", "admin")
      .whereNot('id', user.id);
    
    await Notification.send(admins, new NewUserJoinedNotification({ user }));
  }
}