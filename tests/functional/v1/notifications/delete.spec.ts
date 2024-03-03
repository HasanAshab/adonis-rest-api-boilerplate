import { test } from '@japa/runner'
import User from '#models/user'
import NotificationFactory from 'database/factories/notification_factory'

/*
Run this suits:
node ace test functional --files="v1/notifications/delete.spec.ts"
*/
test.group('Notifications / Delete', (group) => {
  let user: User
  let notification

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
    notification = await NotificationFactory.new().belongsTo(user).create()
  })

  test('Should delete notification', async ({ client, expect }) => {
    const response = await client.delete(`/api/v1/notifications/${notification.id}`).loginAs(user)

    response.assertStatus(204)
    await expect(notification.exists()).resolves.toBeFalse()
  })

  test("Shouldn't delete others notification", async ({ client, expect }) => {
    const anotherUser = await User.factory().create()

    const response = await client
      .delete(`/api/v1/notifications/${notification.id}`)
      .loginAs(anotherUser)

    response.assertStatus(404)
    await expect(notification.exists()).resolves.toBeTrue()
  })
})
