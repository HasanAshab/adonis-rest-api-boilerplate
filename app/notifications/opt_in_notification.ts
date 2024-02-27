import type { NotificationContract } from '@ioc:Verful/Notification'
import type User from '#app/Models/User'

export default abstract class OptInNotification implements NotificationContract {
  public abstract notificationType: string;
  
  public via(notifiable: User) {
    return notifiable.notificationPreferenceFor(this.notificationType)
  }
}