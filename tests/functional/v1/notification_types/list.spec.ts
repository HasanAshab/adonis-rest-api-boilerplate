import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import type User from '#models/user'
import NotificationTypeCollection from '#resources/v1/notification_type/notification_type_collection'
import { UserFactory } from '#factories/user_factory'
import { NotificationTypeFactory } from '#factories/notification_type_factory'


/*
Run this suits:
node ace test functional --files="v1/notification_types/list.spec.ts"
*/
test.group('Notification Types / List', (group) => {
  let user: User

  refreshDatabase(group)

  group.setup(async () => {
    user = await UserFactory.create()
  })

  test('Should get notification types list', async ({ client }) => {
    const notificationTypes = await NotificationTypeFactory.createMany(2)

    const response = await client.get('/api/v1/notification-types').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains(NotificationTypeCollection.make(notificationTypes))
  })

  test('Should get notification', async ({ client }) => {
    const notificationType = await NotificationTypeFactory.create()
    const response = await client
      .get('/api/v1/notification-types/' + notificationType.id)
      .loginAs(user)

    response.assertStatus(200)
    response.assertBodyHaveProperty('data', notificationType)
  })
})
