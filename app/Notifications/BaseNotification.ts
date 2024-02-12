import type { NotificationContract } from '@ioc:Verful/Notification'
import type User from 'App/Models/User'
import { keys, pickBy } from 'lodash'

export default abstract class BaseNotification implements NotificationContract {
  public abstract notificationType: string;
  
  public via(notifiable: User) {
    //await notifiable.loadIfNotLoaded('settings')
    
    return notifiable.related('notificationPreferences')
      .query()
      .whereHas('notificationType', () => {
        query.where('type', this.notificationType)
      })
      .pluck('channel')
  }
  
  public async via(notifiable: User) {
    await notifiable.loadIfNotLoaded('settings')
    const preference = notifiable.settings.notificationPreference[this.notificationType]
    
    if(!preference) {
      throw new Error(`Notification type "${this.notificationType}" doesn't exists.`)
    }
    
    return keys(pickBy(preference))
  }
}