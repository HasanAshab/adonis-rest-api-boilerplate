import { test } from '@japa/runner'
import User from 'App/Models/User'
import Config from '@ioc:Adonis/Core/Config'

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
    })

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.token')
  })

  test("shouldn't login with wrong password", async ({ client, expect }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'wrong-pass',
    })

    response.assertStatus(401)
    expect(response.body()).not.toHaveProperty('data.token')
  })

  test("shouldn't login manually in social account", async ({ client, expect }) => {
    const user = await User.factory().social().create()
    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
    })

    response.assertStatus(401)
    expect(response.body()).not.toHaveProperty('data.token')
  })

  test('should prevent Brute Force login', async ({ client, expect }) => {
    const limit = Config.get('auth.loginAttemptThrottler.maxFailedAttempts')

    const payload = {
      email: user.email,
      password: 'wrong-pass',
    }
    const responses = []

    for (let i = 0; i < limit + 1; i++) {
      const response = await client.post('/api/v1/auth/login').json(payload)
      responses.push(response)
    }

    const lockedResponse = await client.post('/api/v1/auth/login').json(payload)

    expect(responses.every((res) => res.status() === 401)).toBe(true)
    expect(lockedResponse.status()).toBe(429)
  })

  test('Login should flag for two factor auth', async ({ client }) => {
    const user = await User.factory().withPhoneNumber().twoFactorAuthEnabled().create()

    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
    })

    response.assertStatus(200)
    response.assertBodyNotHaveProperty('data.token')
    response.assertBodyHaveProperty('twoFactor', true)
  })
})
