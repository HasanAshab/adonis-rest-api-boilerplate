import type { NotificationContract } from '@ioc:verful/notification'
import type User from '#app/models/user'

export default abstract class OptInNotification implements NotificationContract {
  public abstract notificationType: string;
  
  public via(notifiable: User) {
    return notifiable.notificationPreferenceFor(this.notificationType)
  }
}