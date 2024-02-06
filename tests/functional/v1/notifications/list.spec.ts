import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationFactory from 'Database/factories/NotificationFactory'
import NotificationCollection from 'App/Http/Resources/v1/notification/NotificationCollection'
import ShowNotificationResource from 'App/Http/Resources/v1/notification/ShowNotificationResource'

/*
Run this suits:
node ace test functional --files="v1/notifications/list.spec.ts"
*/
test.group('Notifications / List', group => {
  let user: User;

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
  })

  test('Should get notifications list', async ({ client }) => {
    const notifications = await NotificationFactory.new().count(2).belongsTo(user).create()
    
    const response = await client.get('/api/v1/notifications').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains(NotificationCollection.make(notifications))
  })
  
  test("Shouldn't get others notifications list", async ({ client }) => {
    const anotherUser = await User.factory().create()
    await NotificationFactory.new().belongsTo(anotherUser).create()

    const response = await client.get('/api/v1/notifications').loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyHaveProperty('data', {})
  })

  test('Should get notification', async ({ client }) => {
    const notification = await NotificationFactory.new().belongsTo(user).create()
    const response = await client.get('/api/v1/notifications/' + notification.id).loginAs(user)
   
    response.assertStatus(200)
    response.assertBodyContains(
      ShowNotificationResource.make(notification).toJSON()
    )
  })
  
  test('Should not get others notification', async ({ client }) => {
    const anotherUser = await User.factory().create()
    const notification = await NotificationFactory.new().belongsTo(anotherUser).create(),

    const response = await client.get('/api/v1/notifications/' + notification.id).loginAs(user)
    
    response.assertStatus(404)
    response.assertBodyNotHaveProperty('data')
  })
})