import Notification from '@ioc:Verful/Notification'
import NewUserJoinedNotification from '#app/Notifications/NewUserJoinedNotification'
import User from '#app/Models/User'
import { Listener } from "@adonisjs/core/events";
import { EventsList } from "@adonisjs/core/events";

export default class SendNewUserJoinedNotificationToAdmins implements Listener<'registered'> {
  async dispatch({ user }: EventsList['registered']) {
    const admins = await User.withRole('admin').preload('notificationPreferences').except(user)
    await Notification.send(admins, new NewUserJoinedNotification(user))
  }
}
