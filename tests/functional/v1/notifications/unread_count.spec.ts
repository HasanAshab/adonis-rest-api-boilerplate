import { test } from '@japa/runner'
import { UserFactory } from '#factories/user_factory'

/*
Run this suits:
node ace test functional --files="v1/notifications/unread_count.spec.ts"
*/
test.group('Notifications / Unread count', (group) => {
  test('Should get unread notifications count', async ({ client, expect }) => {
    const user = await UserFactory.with('notifications', 3, notification => {
      notification.merge([
        { readAt: null },
        { readAt: null }
      ])
    }).create()
    const anotherUser = await UserFactory.with('notifications', 1, notification => notification.apply('unread')).create()
    
    const response = await client.get('/api/v1/notifications/unread-count').loginAs(user)

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.count', 2)
  })
})
