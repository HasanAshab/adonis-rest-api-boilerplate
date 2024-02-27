import OptInNotification from '#app/notifications/opt_in_notification'
import type User from '#app/models/user'
import NewUserJoinedMail from '#app/mails/new_user_joined_mail'

export default class NewUserJoinedNotification extends OptInNotification {
  public notificationType = 'App Updates'
  
  constructor(private user: User) {}

  toMail(notifiable: User) {
    return new NewUserJoinedMail(notifiable, this.user)
  }

  toDatabase(notifiable: User) {
    return { user: this.user }
  }
}
