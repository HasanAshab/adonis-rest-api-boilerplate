import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationService from 'App/Services/NotificationService'
import NotificationType from 'App/Models/NotificationType'


/*
Run this suit:
node ace test functional --files="v1/settings/update.spec.ts"
*/
test.group('Settings / Update', (group) => {
  test('Should update notification preference', async ({ client }) => {
    await NotificationType.createMany([
      {
        type: 'announcement',
        name: 'Announcements',
        groupName: 'App Updates',
        description: 'bla'.repeat(20)
      },
      {
        type: 'feature',
        name: 'Feature News',
        groupName: 'App Updates',
        description: 'bla'.repeat(20)
      },
      {
        type: 'liked',
        name: 'Liked',
        groupName: 'Community',
        description: 'bla'.repeat(20)
      }
    ])
    
    const user = await User.factory().hasSettings().create()
    await user.load('settings')
    
    const { notificationPreference } = user.settings;
    
    
    const response = await client.patch('/api/v1/settings/notification-preference').loginAs(user).json({
      
    })
    await user.settings.refresh()
    
    response.assertStatus(200)
    expect(user.settings.notificationPreference)
  })
})
