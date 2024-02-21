import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationFactory from 'Database/factories/NotificationFactory'
import ListNotificationResource from '~/app/http/resources/v1/notification/ListNotificationResource'

/*
Run this suits:
node ace test functional --files="v1/notifications/mark_as_read.spec.ts"
*/
test.group('Notifications / Mark As Read', (group) => {
  let user: User

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
  })

  test('Should mark notification as read', async ({ client, expect }) => {
    const notification = await NotificationFactory.new().unread().belongsTo(user).create()

    const response = await client
      .patch(`/api/v1/notifications/${notification.id}/read`)
      .loginAs(user)
    await notification.refresh()

    response.assertStatus(200)
    expect(notification.readAt).not.toBeNull()
  })

  test('Should mark all notifications as read', async ({ client, expect }) => {
    const notifications = await NotificationFactory.new()
      .belongsTo(user)
      .count(3)
      .unread()
      .belongsTo(user)
      .create()

    const response = await client.patch('/api/v1/notifications/read').loginAs(user)

    response.assertStatus(200)
    for (const notification of notifications) {
      await notification.refresh()
      expect(notification.readAt).not.toBeNull()
    }
  })

  test("Shouldn't mark others notification as read", async ({ client, expect }) => {
    const anotherUser = await User.factory().create()
    const notification = await NotificationFactory.new().belongsTo(anotherUser).unread().create()

    const response = await client
      .patch(`/api/v1/notifications/${notification.id}/read`)
      .loginAs(user)
    await notification.refresh()

    response.assertStatus(404)
    expect(notification.readAt).toBeNull()
  })
})
