import type { NotificationContract, NotificationConfig } from '@ioc:Verful/Notification'
import type User from 'App/Models/User'

export default abstract class BaseNotification implements NotificationContract {
  public abstract type: NotificationConfig['types'][number];
  
  public async via(notifiable: User) {
    await notifiable.loadIfNotLoaded('settings')
    return notifiable.settings.notificationPreference[this.type]
  }
}