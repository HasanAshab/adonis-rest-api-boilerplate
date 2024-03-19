import OptInNotification from '#app/notifications/opt_in_notification'
import type User from '#models/user'
import NewUserJoinedMail from '#mails/new_user_joined_mail'

export default class NewUserJoinedNotification extends OptInNotification {
  notificationType = 'App Updates'

  constructor(private user: User) {
    super()
  }

  toMail(notifiable: User) {
    return new NewUserJoinedMail(notifiable, this.user)
  }

  toDatabase(notifiable: User) {
    return { user: this.user }
  }
}
