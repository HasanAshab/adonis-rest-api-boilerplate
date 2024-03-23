import { test } from '@japa/runner'
import User from '#models/user'
import LoggedDevice from '#models/logged_device'


/*
Run this suits:
node ace test  --files="v1/settings/login_activities.spec.ts"
*/
test.group('V1 / Settings / Login Activities', () => {
  test('should get login activities', async ({ client }) => {
    const user = await User.factory().create()
    const loggedDevices = await LoggedDevice.factory().count(3).create()
    for(const device of loggedDevices) {
      await user.createTrackableToken(device.id, '127.0.0.1')
    }

    const response = await client
      .get('/api/v1/settings/login-activities')
      .usingDevice(loggedDevices[0])
      .loginAs(user)


    response.assertStatus(200)
    response.assertBodyHaveProperty('data.length', 3)
  })
})