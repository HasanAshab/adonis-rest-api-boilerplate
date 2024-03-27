import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import NotificationFactory from 'database/factories/notification_factory'
import NotificationCollection from '#resources/v1/notification/notification_collection'
import ShowNotificationResource from '#resources/v1/notification/show_notification_resource'

/*
Run this suits:
node ace test functional --files="v1/notifications/list.spec.ts"
*/
test.group('Notifications / List', (group) => {
  let user: User

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await UserFactory.create()
  })

  test('Should get notifications list', async ({ client }) => {
    const notifications = await NotificationFactory.new().count(2).belongsTo(user).create()

    const response = await client.get('/api/v1/notifications').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains(NotificationCollection.make(notifications))
  })

  test("Shouldn't get others notifications list", async ({ client }) => {
    const anotherUser = await UserFactory.create()
    await NotificationFactory.new().belongsTo(anotherUser).create()

    const response = await client.get('/api/v1/notifications').loginAs(user)

    response.assertStatus(200)
    response.assertBodyHaveProperty('data', {})
  })

  test('Should get notification', async ({ client }) => {
    const notification = await NotificationFactory.new().belongsTo(user).create()
    const response = await client.get('/api/v1/notifications/' + notification.id).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains(ShowNotificationResource.make(notification))
  })

  test('Should not get others notification', async ({ client }) => {
    const anotherUser = await UserFactory.create()
    const notification = await NotificationFactory.new().belongsTo(anotherUser).create()

    const response = await client.get('/api/v1/notifications/' + notification.id).loginAs(user)

    response.assertStatus(404)
    response.assertBodyNotHaveProperty('data')
  })
})
