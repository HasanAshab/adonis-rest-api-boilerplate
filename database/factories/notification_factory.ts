import Factory from '#models/traits/has_factory/factory'
import User from '#models/user'
import BaseModel from '#models/base_model'
import createNotificationModel from '@verful/notifications/build/src/models/database_notification'
import { DateTime } from 'luxon'

//TODO
const Notification = createNotificationModel('notifications')
Notification.prototype.exists = function () {
  return Notification.query().whereUid(this.id).exists()
}
Notification.prototype.refresh = BaseModel.prototype.refresh


export default class NotificationFactory extends Factory {
  static Model = Notification

  definition() {
    return {
      notifiableId: 1,
      data: { text: this.faker.lorem.words(5) },
      readAt: DateTime.local(),
    }
  }

  unread() {
    return this.state((notification) => {
      //delete notification.readAt;
      notification.readAt = null
      return notification
    })
  }

  betweenLastYear() {
    return this.state((notification) => {
      notification.createdAt = DateTime.fromJSDate(this.faker.date.past())
      return notification
    })
  }

  belongsTo(user: User) {
    return this.state((notification) => {
      notification.notifiableId = user.id
      return notification
    })
  }
}
