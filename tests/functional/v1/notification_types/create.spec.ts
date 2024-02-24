import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationType from 'App/Models/NotificationType'


/*
Run this suits:
node ace test functional --files="v1/notification_types/create.spec.ts"
*/
test.group('Notification Types / Create', (group) => {
  let admin: User

  refreshDatabase(group)
  
  group.each.setup(async () => {
    admin = await User.factory().withRole('admin').create()
  })

  test('Should create notification type', async ({ client, expect }) => {
    const data = {
      name: 'name',
      displayText: 'Text',
      groupName: 'Group Name',
      description: 'description bla bla ...'
    }

    const response = await client.post('/api/v1/notification-types/').loginAs(admin).json(data)

    response.assertStatus(201)
    await expect(NotificationType.exists(data)).resolves.toBeTrue()
  })
  

  test('Users should not create notification type', async ({ client, expect }) => {
    const user = await User.factory().create()
    const data = {
      name: 'name',
      displayText: 'Text',
      groupName: 'Group Name',
      description: 'description bla bla ...'
    }

    const response = await client.post('/api/v1/notification-types/').loginAs(user).json(data)

    response.assertStatus(403)
    await expect(NotificationType.exists(data)).resolves.toBeFalse()
  })

  test('Should create notification type with existing name', async ({ client, expect }) => {
    const existingNotificationType = await NotificationType.factory().create()
    const data = {
      name: existingNotificationType.name,
      displayText: 'Text',
      groupName: 'Group Name',
      description: 'description bla bla ...'
    }

    const response = await client.post('/api/v1/notification-types').loginAs(admin).json(data)

    response.assertStatus(422)
    await expect(NotificationType.exists(data)).resolves.toBeFalse()
  })
})
