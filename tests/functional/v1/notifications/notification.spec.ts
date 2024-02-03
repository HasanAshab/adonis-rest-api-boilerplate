import { test } from '@japa/runner'
//import User, { UserDocument } from '~/app/models/User'
//import Notification from '~/app/models/Notification'
//import NotificationFactory from 'Database/factories/NotificationFactory'

//await NotificationFactory.new().belongsTo(user).belongsTo(user).betweenLastYear().create()
return;
test.group('Notification', () => {

  test('Should get unread notifications count', async ({ client, expect }) => {
    await Promise.all([
      NotificationFactory.new().belongsTo(user).count(2).unread().belongsTo(user).create(),
      NotificationFactory.new().belongsTo(user).create({ userId: user._id }),
    ])
    const response = await client.get('/api/v1/notifications/unread-count').loginAs(user)
    response.assertStatus(200)
    expect(response.body.data.count).toBe(2)
  })

  test('Should delete notification', async ({ client, expect }) => {
    let notification = await NotificationFactory.new().belongsTo(user).belongsTo(user).create()
    const response = await client.delete(`/notifications/${notification._id}`).loginAs(user)
    response.assertStatus(204)
    notification = await Notification.findById(notification._id)
    expect(notification).toBeNull()
  })
  test("Shouldn't delete others notification", async ({ client, expect }) => {
    let notification = await NotificationFactory.new().belongsTo(user).create()
    const response = await client.delete(`/notifications/${notification._id}`).loginAs(user)
    response.assertStatus(404)
    notification = await Notification.findById(notification._id)
    expect(notification).not.toBeNull()
  })
})
