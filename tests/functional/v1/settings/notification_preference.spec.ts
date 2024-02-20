import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationType from 'App/Models/NotificationType'
import NotificationPreferenceCollection from 'App/Http/Resources/v1/Settings/NotificationPreferenceCollection'
import NotificationTypeSeeder from 'Database/seeders/NotificationTypeSeeder'
import NotificationService from 'App/Services/NotificationService'
import { clone } from 'lodash'

/*
Run this suit:
node ace test functional --files="v1/settings/notification_preference.spec.ts"
*/
test.group('Settings / Notification Preference', (group) => {
  let user: User
  
  refreshDatabase(group)
  
  group.each.setup(async () => {
    await new NotificationTypeSeeder().run()
    user = await User.factory().hasNotificationPreferences().create()
  })
  
  test('Should get notification preference settings', async ({ client }) => {
    await user.load('notificationPreferences')
    
    const response = await client.get('/api/v1/settings/notification-preference').loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyContains(
      NotificationPreferenceCollection.make(user.notificationPreferences)
    )
  })
  
  test('Should update notification preference', async ({ client, expect }) => {
    const availableChannels = new NotificationService().channels()
    const preferedChannels = clone(availableChannels).filter(channel => channel !== 'email')
    const { id: updatedId } = await NotificationType.first()

    const response = await client.patch('/api/v1/settings/notification-preference').loginAs(user).json({
      [updatedId]: {
        email: false,
        app: true
      }
    })
    const channelPreferences = await user.related('notificationPreferences').pivotQuery()
    

    response.assertStatus(200)
    channelPreferences.forEach(({ id, channels }) => {
      const expectedChannels = id === updatedId ? preferedChannels : availableChannels
      expect(channels).toEqual(expectedChannels)
    })
  })
})
