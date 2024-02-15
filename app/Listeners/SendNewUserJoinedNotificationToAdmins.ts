import type { Listener, EventsList } from '@ioc:Adonis/Core/Event'
import Notification from '@ioc:Verful/Notification'
import NewUserJoinedNotification from 'App/Notifications/NewUserJoinedNotification'
import User from 'App/Models/User'

export default class SendNewUserJoinedNotificationToAdmins implements Listener<'registered'> {
  async dispatch({ user }: EventsList['registered']) {
    const admins = await User.withRole('admin').preload('notificationPreferences').except(user)
    await Notification.send(admins, new NewUserJoinedNotification(user))
  }
}
