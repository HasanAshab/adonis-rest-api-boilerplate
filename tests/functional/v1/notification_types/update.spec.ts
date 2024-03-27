import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import NotificationType from '#models/notification_type'

/*
Run this suits:
node ace test functional --files="v1/notification_types/update.spec.ts"
*/
test.group('Notification Types / Update', (group) => {
  let admin: User
  let notificationType: NotificationType

  refreshDatabase(group)

  group.each.setup(async () => {
    notificationType = await NotificationTypeFactory.create()
    admin = await UserFactory.withRole('admin').create()
  })

  test('Should update notification type', async ({ client, expect }) => {
    const data = {
      name: 'new_name',
      displayText: 'New Text',
      groupName: 'Group Name',
      description: 'new description bla bla ...',
    }

    const response = await client
      .patch('/api/v1/notification-types/' + notificationType.id)
      .loginAs(admin)
      .json(data)
    await notificationType.refresh()

    response.assertStatus(200)
    expect(notificationType).toMatchObject(data)
  })

  test('Users should not update notification type', async ({ client, expect }) => {
    const user = await UserFactory.create()
    const displayText = 'New Text'

    const response = await client
      .patch('/api/v1/notification-types/' + notificationType.id)
      .loginAs(user)
      .json({ displayText })
    await notificationType.refresh()

    response.assertStatus(403)
    expect(notificationType.displayText).not.toBe(displayText)
  })

  test('Should update notification type with existing name', async ({ client, expect }) => {
    const displayText = 'New Text'
    const existingNotificationType = await NotificationTypeFactory.create()

    const response = await client
      .patch('/api/v1/notification-types/' + notificationType.id)
      .loginAs(admin)
      .json({
        name: existingNotificationType.name,
      })
    await notificationType.refresh()

    response.assertStatus(422)
    expect(notificationType.name).not.toBe(existingNotificationType.name)
  })
})
