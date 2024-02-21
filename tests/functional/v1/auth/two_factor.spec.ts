import { test } from '@japa/runner'
import User from 'App/Models/User'
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService'
import Token from 'App/Models/Token'
import Twilio from '@ioc:Adonis/Addons/Twilio'


test('should login a user with valid otp (2FA)', async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().twoFactorAuthEnabled().create()
    const otp = await twoFactorAuthService.token(user)
    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
      otp,
    })

    response.assertStatus(200)
    expect(response.body()).toHaveProperty('data.token')
  })

  test("shouldn't login a user with invalid OTP (2FA)", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().twoFactorAuthEnabled().create()
    const response = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'password',
      otp: twoFactorAuthService.generateOTPCode(),
    })

    expect(response.body()).not.toHaveProperty('data.token')
    response.assertStatus(401)
  })

/*
Run this suits:
node ace test functional --files="v1/auth/two_factor.spec.ts"
*/
test.group('Auth/TwoFactor', (group) => {
  const twoFactorAuthService = new TwoFactorAuthService()
  let user
  let token

  refreshDatabase(group)

  group.each.setup(async () => {
    Twilio.fake()
    user = await User.factory().hasSettings().create()
  })

  test('Should send otp through sms', async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create()

    const response = await client.post(`/api/v1/auth/two-factor/challenges`)
      .json()

    const tokenCreated = await Token.exists({
      key: user.id,
      type: '2fa',
    })

    Twilio.assertMessaged(user.phoneNumber)
    expect(response.status()).toBe(200)
    expect(tokenCreated).toBe(true)
  })

  test('Should send otp through call', async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true, 'call').create()
    const response = await client.post(`/api/v1/auth/two-factor/send-otp/${user.id}`)

    const tokenCreated = await Token.exists({
      key: user.id,
      type: '2fa',
    })

    expect(response.status()).toBe(200)
    expect(tokenCreated).toBe(true)
    Twilio.assertCalled(user.phoneNumber)
  })

  test("Shouldn't send otp when the method is authenticator", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true, 'app').create()

    const response = await client.post(`/api/v1/auth/two-factor/send-otp/${user.id}`)
    const tokenCreated = await Token.exists({
      key: user.id,
      type: '2fa',
    })

    expect(response.status()).toBe(200)
    expect(tokenCreated).toBe(false)
  })

  test("Shouldn't send otp to phone numberless user", async ({ client, expect }) => {
    const user = await User.factory().hasSettings(true).create()
    const response = await client.post(`/api/v1/auth/two-factor/send-otp/${user.id}`)
    const tokenCreated = await Token.exists({
      key: user.id,
      type: '2fa',
    })

    expect(response.status()).toBe(200)
    expect(tokenCreated).toBe(false)
  })

  test('should recover account with valid recovery code', async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create()
    const [code] = await twoFactorAuthService.generateRecoveryCodes(user, 1)
    const response = await client.post('/api/v1/auth/two-factor/recover').json({
      email: user.email,
      code,
    })

    expect(response.status()).toBe(200)
    expect(response.body().data).toHaveProperty('token')
  })

  test("shouldn't recover account with same recovery code multiple times", async ({
    client,
    expect,
  }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create()
    const data = {
      email: user.email,
      code: (await twoFactorAuthService.generateRecoveryCodes(user, 1))[0],
    }

    const response1 = await client.post('/api/v1/auth/two-factor/recover').json(data)
    const response2 = await client.post('/api/v1/auth/two-factor/recover').json(data)

    expect(response1.status()).toBe(200)
    expect(response2.status()).toBe(401)
    expect(response1.body().data).toHaveProperty('token')
    expect(response2.body()).not.toHaveProperty('data')
  })

  test("shouldn't recover account with invalid recovery code", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create()
    await twoFactorAuthService.generateRecoveryCodes(user, 1)

    const response = await client.post('/api/v1/auth/two-factor/recover').json({
      email: user.email,
      code: 'foo-bar',
    })
    expect(response.status()).toBe(401)
    expect(response.body()).not.toHaveProperty('data')
  })
})
