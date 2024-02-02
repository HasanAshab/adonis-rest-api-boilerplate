import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationFactory from 'Database/factories/NotificationFactory'

//await NotificationFactory.new().belongsTo(user).betweenLastYear().create()

test.group('Notifications / List', () => {
  
  test('Should get notifications', async ({ client, expect }) => {
    const notifications = await NotificationFactory.new().count(2).belongsTo(user).create()
    const response = await client.get('/api/v1/notifications').loginAs(user)
   
    response.assertStatus(200)
    expect(response.body.data).toEqualDocument(notifications)
  })
  
  test("Shouldn't get others notifications", async ({ client, expect }) => {
    const [notifications] = await Promise.all([
      Notification.factory().count(2).belongsTo(user).create(),
      Notification.factory().create(),
    ])
    const response = await client.get('/api/v1/notifications').loginAs(user)
    response.assertStatus(200)
    expect(response.body.data).toEqualDocument(notifications)
  })
})