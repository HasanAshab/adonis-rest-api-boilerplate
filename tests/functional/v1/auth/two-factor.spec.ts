import { test } from '@japa/runner'
import User from 'App/Models/User'
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService'
import Token from 'App/Models/Token'
import Twilio from '@ioc:Adonis/Addons/Twilio'

/*
Run this suits:
node ace test functional --files="v1/auth/two-factor.spec.ts"
*/
test.group('Auth/TwoFactor', (group) => {
  const twoFactorAuthService = new TwoFactorAuthService()
  let user

  refreshDatabase(group)

  group.each.setup(async () => {
    Twilio.fake()
  })

  group.each.setup(async () => {
    Twilio.restore()
    user = await User.factory().hasSettings().create()
  })

  group.each.setup(async () => {
    Twilio.fake()
    user = await User.factory().hasSettings().create()
  })

  test('Should enable Two Factor Authorization', async ({ client, expect }) => {
    const user = await User.factory().hasSettings().withPhoneNumber().create()

    const response = await client
      .post('/api/v1/auth/two-factor/setup')
      .loginAs(user)
      .json({ enable: true })

    await user.load('settings')
    expect(response.status()).toBe(200)
    expect(response.body().data.recoveryCodes).toHaveLength(10)

    expect(user.settings.twoFactorAuth).toEqual({
      enabled: true,
      method: 'sms',
      secret: null,
    })
  })

  test('Should disable Two Factor Authorization', async ({ client, expect }) => {
    const user = await User.factory().hasSettings(true).withPhoneNumber().create()
    const response = await client
      .post('/api/v1/auth/two-factor/setup')
      .loginAs(user)
      .json({ enable: false })
    await user.load('settings')

    expect(response.status()).toBe(200)
    expect(user.settings.twoFactorAuth.enabled).toBe(false)
  })

  test('Two Factor Authorization should flag for phone number if not setted', async ({
    client,
    expect,
  }) => {
    const response = await client
      .post('/api/v1/auth/two-factor/setup')
      .loginAs(user)
      .json({ enable: true })
    await user.load('settings')

    expect(response.status()).toBe(422)
    expect(response.body().phoneNumberRequired).toBe(true)
    expect(user.settings.twoFactorAuth.enabled).toBe(false)
  })

  test('Two Factor Authorization app method sends OTP Auth URL', async ({ client, expect }) => {
    const response = await client
      .post('/api/v1/auth/two-factor/setup')
      .json({ enable: true, method: 'app' })
      .loginAs(user)

    await user.load('settings')

    expect(response.status()).toBe(200)
    expect(response.body().data).toHaveProperty('otpAuthUrl')
    expect(response.body().data.recoveryCodes).toHaveLength(10)
    expect(user.settings.twoFactorAuth.enabled).toBe(true)
  })

  test('Should change Two Factor Authorization method', async ({ client, expect }) => {
    const user = await User.factory().hasSettings(true).withPhoneNumber().create()

    const response = await client
      .post('/api/v1/auth/two-factor/setup')
      .json({ method: 'call' })
      .loginAs(user)

    await user.load('settings')

    expect(response.status()).toBe(200)
    expect(response.body().data.recoveryCodes).toHaveLength(10)
    expect(user.settings.twoFactorAuth.method).toBe('call')
  })

  test('Should send otp through sms', async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create()

    const response = await client.post(`/api/v1/auth/two-factor/send-otp/${user.id}`)

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

  test("Shouldn't send otp when the method is app", async ({ client, expect }) => {
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

  test('should recover a user with valid recovery code', async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create()
    const [code] = await twoFactorAuthService.generateRecoveryCodes(user, 1)
    const response = await client.post('/api/v1/auth/two-factor/recover').json({
      email: user.email,
      code,
    })

    expect(response.status()).toBe(200)
    expect(response.body().data).toHaveProperty('token')
  })

  test("shouldn't recover a user with same recovery code multiple times", async ({
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

  test("shouldn't recover a user with invalid recovery code", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create()
    await twoFactorAuthService.generateRecoveryCodes(user, 1)

    const response = await client.post('/api/v1/auth/two-factor/recover').json({
      email: user.email,
      code: 'foo-bar',
    })
    expect(response.status()).toBe(401)
    expect(response.body()).not.toHaveProperty('data')
  })

  test('should generate new recovery codes', async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create()
    const oldCodes = await twoFactorAuthService.generateRecoveryCodes(user)

    const response = await client
      .post('/api/v1/auth/two-factor/generate-recovery-codes')
      .loginAs(user)

    expect(response.status()).toBe(200)
    expect(response.body().data).toHaveLength(10)
    expect(response.body().data).not.toEqual(oldCodes)
  })
})
