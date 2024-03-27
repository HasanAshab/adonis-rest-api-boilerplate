import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import { UserFactory } from '#factories/user_factory'
import NotificationCollection from '#resources/v1/notification/notification_collection'
import ShowNotificationResource from '#resources/v1/notification/show_notification_resource'

/*
Run this suits:
node ace test functional --files="v1/notifications/list.spec.ts"
*/
test.group('Notifications / List', (group) => {
  refreshDatabase(group)
  
  test('Should get notifications list', async ({ client }) => {
    const user = await UserFactory.with('notifications', 2).create()

    const response = await client.get('/api/v1/notifications').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains(NotificationCollection.make(user.notifications))
  })

  test("Shouldn't get others notifications list", async ({ client }) => {
    const user = await UserFactory.create()
    const anotherUser = await UserFactory.with('notifications', 1).create()

    const response = await client.get('/api/v1/notifications').loginAs(user)

    response.assertStatus(200)
    response.assertBodyHaveProperty('data', [])
  })

  test('Should get notification', async ({ client }) => {
    const user = await UserFactory.with('notifications', 1).create()
    const notification = user.notifications[0]
    const response = await client.get('/api/v1/notifications/' + notification.id).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains(ShowNotificationResource.make(notification))
  })

  test('Should not get others notification', async ({ client }) => {
    const user = await UserFactory.create()
    const anotherUser = await UserFactory.with('notifications', 1).create()
    const notification = anotherUser.notifications[0]

    const response = await client.get('/api/v1/notifications/' + notification.id).loginAs(user)

    response.assertStatus(404)
    response.assertBodyNotHaveProperty('data')
  })
})
