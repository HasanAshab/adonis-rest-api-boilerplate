import OptInNotification from '#app/Notifications/OptInNotification'
import type User from '#app/Models/User'
import NewUserJoinedMail from '#app/Mails/NewUserJoinedMail'

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
