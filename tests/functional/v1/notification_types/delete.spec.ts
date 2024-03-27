import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import type NotificationType from '#models/notification_type'
import { UserFactory } from '#factories/user_factory'
import { NotificationTypeFactory } from '#factories/notification_type_factory'


/*
Run this suits:
node ace test functional --files="v1/notification_types/delete.spec.ts"
*/
test.group('Notification Types / Delete', (group) => {
  let notificationType: NotificationType
  refreshDatabase(group)

  group.each.setup(async () => {
    notificationType = await NotificationTypeFactory.create()
  })

  test('Should delete notification type', async ({ client, expect }) => {
    const admin = await UserFactory.apply('admin').create()

    const response = await client
      .delete('/api/v1/notification-types/' + notificationType.id)
      .loginAs(admin)

    response.assertStatus(204)
    await expect(notificationType.exists()).resolves.toBeFalse()
  })

  test('Users should not delete notification type', async ({ client, expect }) => {
    const user = await UserFactory.create()

    const response = await client
      .delete('/api/v1/notification-types/' + notificationType.id)
      .loginAs(user)

    response.assertStatus(403)
    await expect(notificationType.exists()).resolves.toBeTrue()
  })
})
