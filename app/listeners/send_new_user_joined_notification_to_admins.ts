import Notification from '@ioc:verful/notification'
import NewUserJoinedNotification from '#app/notifications/new_user_joined_notification'
import User from '#models/user'
import { Listener } from "@adonisjs/core/events";
import { EventsList } from "@adonisjs/core/events";

export default class SendNewUserJoinedNotificationToAdmins implements Listener<'registered'> {
  async dispatch({ user }: EventsList['registered']) {
    const admins = await User.withRole('admin').preload('notificationPreferences').except(user)
    await Notification.send(admins, new NewUserJoinedNotification(user))
  }
}
