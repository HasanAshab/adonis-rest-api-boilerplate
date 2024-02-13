import type { NotificationContract } from '@ioc:Verful/Notification'
import type User from 'App/Models/User'

export default abstract class OptInNotification implements NotificationContract {
  public abstract notificationType: string;
  
  public async via(notifiable: User) {
    const preference = await notifiable.related('notificationSettings')
      .query()
      .where('name', this.notificationType)
      .pojo()
      .first()

    return preference?.pivot_channels ?? []
  }
}