import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import LoggedDevice from '#models/logged_device'


/*
Run this suits:
node ace test functional --files="v1/auth/login.spec.ts"
*/
test.group('Auth / Login', (group) => {
  let user

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
  })

  test('should login a user', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
      deviceId: 'device-i'
    })

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.token')
  })

  test("shouldn't login with wrong password", async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'wrong-pass',
      deviceId: 'device-id'
    })

    response.assertStatus(401)
    response.assertBodyNotHaveProperty('data.token')
  })

  test("shouldn't login manually in social account", async ({ client }) => {
    user = await User.factory().social().create()
    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
      deviceId: 'device-id'
    })

    response.assertStatus(401)
    response.assertBodyNotHaveProperty('data.token')
  })

  test('should prevent Brute Force login', async ({ client }) => {
    const limit = 5
    const responses = []
    const payload = {
      email: user.email,
      password: 'wrong-pass',
      deviceId: 'device-id'
    }

    for (let i = 0; i < limit; i++) {
      const response = await client.post('/api/v1/auth/login').json(payload)
      responses.push(response)
    }

    const lockedResponse = await client.post('/api/v1/auth/login').json(payload)

    responses.forEach((response) => {
      response.assertStatus(401)
    })
    lockedResponse.assertStatus(429)
  })

  test('Login should flag for two factor auth on 2FA enabled account', async ({ client }) => {
    user = await User.factory().withPhoneNumber().twoFactorAuthEnabled().create()

    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
      deviceId: 'device-id'
    })

    response.assertStatus(200)
    response.assertBodyNotHaveProperty('data.token')
    response.assertBodyHaveProperty('twoFactor', true)
  })
  
  test('Should login with trusted device on 2FA enabled account', async ({ client }) => {
    const deviceId = 'device-id'
    await LoggedDevice.create({ id: deviceId })
    user = await User.factory().withPhoneNumber().twoFactorAuthEnabled().create()
    await user.trustDevice(deviceId)
    
    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
      deviceId
    })
    
    response.assertStatus(200)
    response.assertBodyHaveProperty('data.token')
  })
})
