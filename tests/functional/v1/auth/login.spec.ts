import { test } from '@japa/runner'
import User from 'App/Models/User'
import Config from '@ioc:Adonis/Core/Config'
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService'


/*
Run this suits:
node ace test functional --files="v1/auth/login.spec.ts"
*/
test.group('Auth / Login', (group) => {
  const twoFactorAuthService = new TwoFactorAuthService()
  let user

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().hasSettings().create()
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

    expect(response.status()).toBe(401)
    expect(response.body()).not.toHaveProperty('data.token')
  })

  test("shouldn't login manually in social account", async ({ client, expect }) => {
    const user = await User.factory().social().create()
    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
    })

    expect(response.status()).toBe(401)
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

  test('Login should flag for otp if not provided for 2FA enabled account', async ({
    client,
    expect,
  }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create()

    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
    })

    expect(response.status()).toBe(401)
    expect(response.header('x-2fa-code')).toBe('required')
    expect(response.body()).not.toHaveProperty('data.token')
  })

  test('should login a user with valid otp (2FA)', async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create()
    const otp = await twoFactorAuthService.createToken(user)
    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
      otp,
    })

    expect(response.status()).toBe(200)
    expect(response.body()).toHaveProperty('data.token')
  })

  test("shouldn't login a user with invalid OTP (2FA)", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create()
    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
      otp: twoFactorAuthService.generateOTPCode(),
    })

    expect(response.body()).not.toHaveProperty('data.token')
    expect(response.status()).toBe(401)
  })
})
