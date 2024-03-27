import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import NotificationFactory from 'database/factories/notification_factory'

/*
Run this suits:
node ace test functional --files="v1/notifications/unread_count.spec.ts"
*/
test.group('Notifications / Unread count', (group) => {
  test('Should get unread notifications count', async ({ client, expect }) => {
    const [user, anotherUser] = await UserFactory.createMany(2)
    await Promise.all([
      NotificationFactory.new().belongsTo(user).count(2).unread().belongsTo(user).create(),
      NotificationFactory.new().belongsTo(user).create(),
      NotificationFactory.new().belongsTo(anotherUser).create(),
    ])

    const response = await client.get('/api/v1/notifications/unread-count').loginAs(user)

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.count', 2)
  })
})
