import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationPreferenceCollection from 'App/Http/Resources/v1/Settings/NotificationPreferenceCollection'
import TwoFactorSettingsResource from 'App/Http/Resources/v1/Settings/TwoFactorSettingsResource'


/*
Run this suit:
node ace test functional --files="v1/settings/get.spec.ts"
*/
test.group('Settings / Get', (group) => {

  test('Should get two factor auth settings', async ({ client }) => {
    const user = await User.factory().create()

    const response = await client.get('/api/v1/settings/two-factor-auth').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains(TwoFactorSettingsResource.make(user))
  })
  
  test('Should get notification preference settings', async ({ client }) => {
    const user = await User.factory().create()
    await user.load('notificationPreferences')
    
    const response = await client.get('/api/v1/settings/notification-preference').loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyContains(
      NotificationPreferenceCollection.make(user.notificationPreferences)
    )
  })
})
