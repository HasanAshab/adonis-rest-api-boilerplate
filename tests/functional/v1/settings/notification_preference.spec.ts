import { test } from '@japa/runner'
import User from 'App/Models/User'
import NotificationType from 'App/Models/NotificationType'
import NotificationPreferenceCollection from 'App/Http/Resources/v1/Settings/NotificationPreferenceCollection'
import NotificationTypeSeeder from 'Database/seeders/NotificationTypeSeeder'
import NotificationService from 'App/Services/NotificationService'
import { except } from 'App/helpers'

/*
Run this suit:
node ace test functional --files="v1/settings/notification_preference.spec.ts"
*/
test.group('Settings / Notification Preference', (group) => {
  let user: User
  const notificationService = new NotificationService
  
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
    const availableChannels = notificationService.channels()
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
      const expectedChannels = id === updatedId 
        ? except(availableChannels, 'email') 
        : availableChannels
      expect(channels).toEqual(expectedChannels)
    })
  })
  
  test('Should unsubscribe email notification', async ({ client }) => {
    const expectedChannels = except(notificationService.channels(), 'email')
    const { name } = await NotificationType.first()
    const token = await notificationService.emailUnsubscriptionToken(user)
   
   
    const response = await client.delete('/api/v1/settings/notification-preference/email-subscription').json({
      notificationType: name,
      id: user.id,
      token,
    })
    const isValidResubscriptionToken = await Token.isValid(
      'email_resubscription',
      notificationService.emailResubscriptionTokenKey(user, name),
      response.body().data.resubscriptionToken
    )
    const preferedChannels = await  user.notificationPreferenceFor(name)

    response.assertStatus(200)
    expect(isValidResubscriptionToken).toBe(true)
    expect(preferedChannels).toEqual(expectedChannels)
  })
  
  test('Should re-subscribe email notification', async ({ client }) => {
    const { id, name } = await NotificationType.first()
    const token = await notificationService.emailResubscriptionToken(user)
    await user.disableNotification(id, 'email')

    const response = await client.post('/api/v1/settings/notification-preference/email-subscription').json({
      notificationType: name,
      id: user.id,
      token,
    })
    const preferedChannels = await user.notificationPreferenceFor(name)

    response.assertStatus(200)
    expect(preferedChannels).toEqual(notificationService.channels())
  })
})
