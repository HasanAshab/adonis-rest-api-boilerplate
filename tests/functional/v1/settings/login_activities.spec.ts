import { test } from '@japa/runner'
import User from '#models/user'
import LoggedDevice from '#models/logged_device'
import LoginActivityCollection from '#resources/v1/settings/login_activity/login_activity_collection'

/*
Run this suits:
node ace test  --files="v1/settings/login_activities.spec.ts"
*/
test.group('V1 / Settings / Login Activities', () => {
  test('should get login activities', async ({ client }) => {
    const user = await User.factory().create()
    const loggedDevices = await LoggedDevice.factory().count(3).create()
    const currentDeviceId = loggedDevices[0].id
    for(const device of loggedDevices) {
      await user.createTrackableToken(device.id, '127.0.0.1')
    }
    
    await user.load('loggedDevices')

    const response = await client
      .get('/api/v1/settings/login-activities')
      .qs({ deviceId: currentDeviceId })
      .loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains(
      LoginActivityCollection.make(user.loggedDevices, currentDeviceId)
    )
  })
})