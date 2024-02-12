import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationType from 'App/Models/NotificationType'
import NotificationTypeCollection from 'App/Http/Resources/v1/NotificationType/NotificationTypeCollection'

/*
Run this suits:
node ace test functional --files="v1/notification_type/list.spec.ts"
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
    const response = await client.get('/api/v1/notification-types/' + notificationType.type).loginAs(user)

    response.assertStatus(200)
    response.assertBodyHaveProperty('data', notificationType)
  })
})
