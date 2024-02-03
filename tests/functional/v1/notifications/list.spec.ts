import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationFactory from 'Database/factories/NotificationFactory'
import ListNotificationResource from '~/app/http/resources/v1/notification/ListNotificationResource'


/*
Run this suits:
node ace test functional --files="v1/notifications/list.spec.ts"
*/
test.group('Notifications / List', group => {
  let user: User

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
  })

  test('Should get notifications', async ({ client }) => {
    const notifications = await NotificationFactory.new().count(2).belongsTo(user).create()
    const response = await client.get('/api/v1/notifications').loginAs(user)
   
    response.assertStatus(200)
    response.assertBodyContains(
      ListNotificationResource.collection(notifications).toJSON()
    )
  })
  
  test("Shouldn't get others notifications", async ({ client, expect }) => {
    const anotherUser = await User.factory().create()
   
    const [notifications] = await Promise.all([
      NotificationFactory.new().count(2).belongsTo(user).create(),
      NotificationFactory.new().belongsTo(anotherUser).create(),
    ])
    
    const response = await client.get('/api/v1/notifications').loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyContains(
      ListNotificationResource.collection(notifications).toJSON()
    )
  })
})