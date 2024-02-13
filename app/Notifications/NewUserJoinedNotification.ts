import OptInNotification from 'App/Notifications/OptInNotification'
import type User from 'App/Models/User'
import NewUserJoinedMail from 'App/Mails/NewUserJoinedMail'

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
