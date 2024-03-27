import factory from '@adonisjs/lucid/factories'
import BaseModel from '#models/base_model'
import createNotificationModel from '@verful/notifications/build/src/models/database_notification'
import { DateTime } from 'luxon'

//TODO
const Notification = createNotificationModel('notifications')
Notification.prototype.exists = function () {
  return Notification.query().whereUid(this.id).exists()
}
Notification.prototype.refresh = BaseModel.prototype.refresh


export const NotificationFactory = factory
  .define(Notification, async ({ faker }) => {
    return {
      notifiableId: 1,
      data: { text: faker.lorem.words(5) },
      readAt: DateTime.local(),
    }
  })
  .state('unread', notification => (notification.readAt = null))
  .state('betweenLastYear', notification => {
    notification.createdAt = DateTime.fromJSDate(faker.date.past())
  })
  .build()