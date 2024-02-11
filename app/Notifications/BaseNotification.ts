import type { NotificationContract } from '@ioc:Verful/Notification'
import type User from 'App/Models/User'


export default abstract class BaseNotification implements NotificationContract {
  public abstract notificationType: string;
  
  public async via(notifiable: User) {
    await notifiable.loadIfNotLoaded('settings')
    return notifiable.settings.notificationPreference[this.notificationType] ?? []
  }
}