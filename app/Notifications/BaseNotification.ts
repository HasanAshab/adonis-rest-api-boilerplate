import type { NotificationContract } from '@ioc:Verful/Notification'
import type User from 'App/Models/User'

export default abstract class BaseNotification implements NotificationContract {
  public abstract notificationType: string;
  
  public async via(notifiable: User) {
    const preference = await notifiable.related('notificationPreferences')
      .query()
      .where('name', this.notificationType)
      .pojo()
      .first()

    return preference?.pivot_channels ?? []
  }
  
  public async via_old(notifiable: User) {
    const preference = await notifiable.related('notificationPreferences')
      .query()
      .whereHas('notificationType', query => {
        query.where('name', this.notificationType)
      })
      .select('channels')
      .first()
    
    return preference?.channels ?? []
  }
}