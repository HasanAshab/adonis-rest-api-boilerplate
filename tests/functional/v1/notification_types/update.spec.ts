import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationType from 'App/Models/NotificationType'


/*
Run this suits:
node ace test functional --files="v1/notification_types/update.spec.ts"
*/
test.group('Notification Types / Update', (group) => {
  let admin: User
  let notificationType: NotificationType
  
  refreshDatabase(group)
  
  group.each.setup(async () => {
    notificationType = await NotificationType.factory().create()
    admin = await User.factory().withRole('admin').create()
  })

  test('Should update notification type', async ({ client, expect }) => {
    const data = {
      type: 'new_type',
      name: 'New Name',
      groupName: 'Group Name',
      description: 'new description bla bla ...'
    }

    const response = await client.patch('/api/v1/notification-types/' + notificationType.id).loginAs(admin).json(data)
    await notificationType.refresh()
    
    response.assertStatus(200)
    expect(notificationType).toMatchObject(data)
  })
  

  test('Users should not update notification type', async ({ client, expect }) => {
    const user = await User.factory().create()
    const name = 'New Name'
    
    const response = await client.patch('/api/v1/notification-types/' + notificationType.id).loginAs(user).json({ name })
    await notificationType.refresh()

    response.assertStatus(403)
    expect(notificationType.name).not.toBe(name)
  })

  test('Should update notification type with existing type', async ({ client, expect }) => {
    const name = 'New Name'
    const existingNotificationType = await NotificationType.factory().create()
    
    const response = await client.patch('/api/v1/notification-types/' + notificationType.id).loginAs(admin).json({ 
      type: existingNotificationType.type
    })
    await notificationType.refresh()

    
    response.assertStatus(422)
    expect(notificationType.type).not.toBe(existingNotificationType.type)
  })
})
