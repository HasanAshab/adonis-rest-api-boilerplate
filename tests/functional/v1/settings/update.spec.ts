import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationService from 'App/Services/NotificationService'
import NotificationType from 'App/Models/NotificationType'
import NotificationTypeSeeder from 'Database/seeders/NotificationTypeSeeder'

/*
Run this suit:
node ace test functional --files="v1/settings/update.spec.ts"
*/
test.group('Settings / Update', (group) => {
  refreshDatabase(group)
  group.each.setup(async () => {
    await new NotificationTypeSeeder().run()
  })
  
  test('Should update notification preference', async ({ client }) => {
    const user = await User.factory().hasSettings().create()
    await user.load('settings')
    const { notificationPreference } = user.settings;
    
    
    const response = await client.patch('/api/v1/settings/notification-preference').loginAs(user).json({
      
    })
    
    await user.settings.refresh()
    
    response.assertStatus(200)
    expect(user.settings.notificationPreference)
  })
  
  test('Should update notification preference', async ({ client }) => {
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
