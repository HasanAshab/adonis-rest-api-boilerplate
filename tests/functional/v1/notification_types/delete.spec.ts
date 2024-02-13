import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationType from 'App/Models/NotificationType'


/*
Run this suits:
node ace test functional --files="v1/notification_types/delete.spec.ts"
*/
test.group('Notification Types / Delete', (group) => {
  let notificationType: NotificationType
  refreshDatabase(group)
  
  group.each.setup(async () {
    notificationType = await NotificationType.factory().create()
  })

  test('Should delete notification type', async ({ client, expect }) => {
    const admin = await User.factory().withRole('admin').create()

    const response = await client.delete('/api/v1/notification-types/' + notificationType.id).loginAs(admin)
    
    response.assertStatus(204)
    await expect(notificationType.exists()).resolves.toBe(false)
  })
  
  test('Users should not delete notification type', async ({ client, expect }) => {
    const user = await User.factory().create()

    const response = await client.delete('/api/v1/notification-types/' + notificationType.id).loginAs(user)
    
    response.assertStatus(403)
    await expect(notificationType.exists()).resolves.toBe(true)
  })
})