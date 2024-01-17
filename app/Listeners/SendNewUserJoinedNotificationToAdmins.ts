import type { Listener, EventsList } from '@ioc:Adonis/Core/Event';
import Notification from '@ioc:Verful/Notification';
import NewUserJoinedNotification from "App/Notifications/NewUserJoinedNotification";
import User from "App/Models/User";

export default class SendNewUserJoinedNotificationToAdmins implements Listener<"registered"> {
  async dispatch({ user }: EventsList["registered"]) {
    //const admins = await User.admins().except(user);
    
    const admins = await User.query()
      .where("role", "admin")
      .whereNot('id', user.id);
    
    await Notification.sendLater(admins, new NewUserJoinedNotification({ user }));
  }
}