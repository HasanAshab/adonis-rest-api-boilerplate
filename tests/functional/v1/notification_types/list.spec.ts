import { test } from '@japa/runner'
import User from '#models/user'
import NotificationType from '#models/notification_type'
import NotificationTypeCollection from '#app/http/resources/v1/notification_type/notification_type_collection'

/*
Run this suits:
node ace test functional --files="v1/notification_types/list.spec.ts"
*/
test.group('Notification Types / List', (group) => {
  let user: User

  refreshDatabase(group)

  group.setup(async () => {
    user = await User.factory().create()
  })

  test('Should get notification types list', async ({ client }) => {
    const notificationTypes = await NotificationType.factory().count(2).create()

    const response = await client.get('/api/v1/notification-types').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains(NotificationTypeCollection.make(notificationTypes))
  })


  test('Should get notification', async ({ client }) => {
    const notificationType = await NotificationType.factory().create()
    const response = await client.get('/api/v1/notification-types/' + notificationType.id).loginAs(user)

    response.assertStatus(200)
    response.assertBodyHaveProperty('data', notificationType)
  })
})
