import type { NotificationContract } from '@ioc:verful/notification'
import type User from '#models/user'

export default abstract class OptInNotification implements NotificationContract {
  abstract notificationType: string

  via(notifiable: User) {
    return notifiable.notificationPreferenceFor(this.notificationType)
  }
}
