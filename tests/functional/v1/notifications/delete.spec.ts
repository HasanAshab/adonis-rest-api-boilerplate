import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import type User from '#models/user'
import { UserFactory } from '#factories/user_factory'

/*
Run this suits:
node ace test functional --files="v1/notifications/delete.spec.ts"
*/
test.group('Notifications / Delete', (group) => {
  let user: User

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await UserFactory.with('notifications', 1).create()
  })

  test('Should delete notification', async ({ client, expect }) => {
    const response = await client.delete(`/api/v1/notifications/${notification.id}`).loginAs(user)

    response.assertStatus(204)
    await expect(user.notification[0].exists()).resolves.toBeFalse()
  })

  test("Shouldn't delete others notification", async ({ client, expect }) => {
    const anotherUser = await UserFactory.create()

    const response = await client
      .delete(`/api/v1/notifications/${notification.id}`)
      .loginAs(anotherUser)

    response.assertStatus(404)
    await expect(user.notifications[0].exists()).resolves.toBeTrue()
  })
})
