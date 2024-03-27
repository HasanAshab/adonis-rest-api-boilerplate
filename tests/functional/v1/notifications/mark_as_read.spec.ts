import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import { UserFactory } from '#factories/user_factory'

/*
Run this suits:
node ace test functional --files="v1/notifications/mark_as_read.spec.ts"
*/
test.group('Notifications / Mark As Read', (group) => {
  refreshDatabase(group)

  test('Should mark notification as read', async ({ client, expect }) => {
    const user = await UserFactory.with('notifications', 1, notification => notification.apply('unread')).create()
    const notification = user.notifications[0]

    const response = await client
      .patch(`/api/v1/notifications/${notification.id}/read`)
      .loginAs(user)
    await notification.refresh()

    response.assertStatus(200)
    expect(notification.readAt).not.toBeNull()
  })

  test('Should mark all notifications as read', async ({ client, expect }) => {
    const user = await UserFactory.with('notifications', 3, notification => notification.apply('unread')).create()

    const response = await client.patch('/api/v1/notifications/read').loginAs(user)

    response.assertStatus(200)
    for (const notification of user.notifications) {
      await notification.refresh()
      expect(notification.readAt).not.toBeNull()
    }
  })

  test("Shouldn't mark others notification as read", async ({ client, expect }) => {
    const user = await UserFactory.create()
    const anotherUser = await UserFactory.with('notifications', 1, notification => notification.apply('unread')).create()
    const notification = anotherUser.notifications[0]

    const response = await client
      .patch(`/api/v1/notifications/${notification.id}/read`)
      .loginAs(user)
    await notification.refresh()

    response.assertStatus(404)
    expect(notification.readAt).toBeNull()
  })
})
