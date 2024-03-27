import { test } from '@japa/runner'
import { range } from 'lodash-es'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import LoggedDevice from '#models/logged_device'

/*
Run this suits:
node ace test functional --files="v1/auth/logout.spec.ts"
*/
test.group('Auth / Logout', (group) => {
  test('API token should be invalid after logout', async ({ client, expect }) => {
    const user = await UserFactory.create()
    const token = await user.createToken()
    const response = await client.post('/api/v1/auth/logout').bearerToken(token.value.release())
    const responseAfterLogout = await client.post('/api/v1/auth/logout').bearerToken(token)

    response.assertStatus(200)
    responseAfterLogout.assertStatus(401)
  })

  test('Should logout on device', async ({ client, expect }) => {
    const user = await UserFactory.create()
    const loggedDevice = await LoggedDeviceFactory.create()
    for (const i of range(3)) {
      await user.createTrackableToken(loggedDevice.id, '127.0.0.1')
    }

    const response = await client
      .post('/api/v1/auth/logout/device/' + loggedDevice.id)
      .loginAs(user)
    await user.load('loggedDevices')
    await user.load('loginSessions')

    response.assertStatus(200)
    expect(user.loggedDevices).toHaveLength(0)
    expect(user.loginSessions).toHaveLength(0)
  })
})
