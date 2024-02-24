import DB from 'DB'
import Config from 'Config'
import User, { UserDocument } from '~/app/models/User'
import Settings from '~/app/models/Settings'

describe('Settings', () => {
  let user: UserDocument
  let token: string

  beforeAll(async () => {
    await DB.connect()
  })

  beforeEach(async (config) => {
    await DB.reset(['User'])
    if (config.user !== false) {
      factory = User.factory().withRole(config.role ?? 'novice')
      if (config.settings !== false) factory.hasSettings(config.mfa)
      if (config.phone) factory.withPhoneNumber()

      user = await factory.create()
      token = user.createToken()
    }
  })

  test(
    "App settings shouldn't accessable by novice users",
    { settings: false },
    async ({ client, expect }) => {
      const requests = [request.get('/settings/app'), request.patch('/settings/app')]
      const responses = await Promise.all(requests.map((request) => request.loginAs(user)))
      const isNotAccessable = responses.every((response) => response.statusCode === 403)
      expect(isNotAccessable).toBeTrue()
    }
  )

  test(
    'Admin should get app settings',
    { role: 'admin', settings: false },
    async ({ client, expect }) => {
      const response = await client.get('/api/v1/settings/app').loginAs(user)
      response.assertStatus(200)
      expect(response.body.data).toEqual(config)
    }
  )

  test(
    'Admin should update app settings',
    { role: 'admin', settings: false },
    async ({ client, expect }) => {
      const response = await client
        .patch('/api/v1/settings/app')
        .loginAs(user)
        .json({
          app: { name: 'FooBar' },
        })
      response.assertStatus(200)
      expect(Config.get('app.name')).toBe('FooBar')
    }
  )

  test('Should get settings', async ({ client, expect }) => {
    const response = await client.get('/api/v1/settings').loginAs(user)
    response.assertStatus(200)
    expect(response.body.data).toEqualDocument(await user.settings)
  })

  test('Should enable Two Factor Authorization', { phone: true }, async ({ client, expect }) => {
    const response = await client
      .post('/api/v1/settings/setup-2fa')
      .loginAs(user)
      .json({ enable: true })
    const settings = await user.settings
    response.assertStatus(200)
    expect(response.body.data.recoveryCodes).toHaveLength(10)
    expect(settings.twoFactorAuth.enabled).toBeTrue()
    expect(settings.twoFactorAuth.method).toBe('sms')
  })

  test(
    'Should disable Two Factor Authorization',
    { mfa: true, phone: true },
    async ({ client, expect }) => {
      const response = await client
        .post('/api/v1/settings/setup-2fa')
        .loginAs(user)
        .json({ enable: false })
      const settings = await user.settings
      response.assertStatus(200)
      expect(settings.twoFactorAuth.enabled).toBeFalse()
    }
  )

  test('Two Factor Authorization should flag for phone number if not setted', async ({
    client,
    expect,
  }) => {
    const response = await client
      .post('/api/v1/settings/setup-2fa')
      .loginAs(user)
      .json({ enable: true })
    const settings = await user.settings
    response.assertStatus(400)
    expect(response.body.data.phoneNumberRequired).toBeTrue()
    expect(settings.twoFactorAuth.enabled).toBeFalse()
  })

  test('Two Factor Authorization app method sends OTP Auth URL', async ({ client, expect }) => {
    const response = await client
      .post('/api/v1/settings/setup-2fa')
      .loginAs(user)
      .json({ enable: true, method: 'app' })
    const settings = await user.settings
    response.assertStatus(200)
    expect(response.body.data).toHaveProperty('otpauthURL')
    expect(response.body.data.recoveryCodes).toHaveLength(10)
    expect(settings.twoFactorAuth.enabled).toBeTrue()
  })

  test(
    'Should change Two Factor Authorization method',
    { mfa: true, phone: true },
    async ({ client, expect }) => {
      const response = await client
        .post('/api/v1/settings/setup-2fa')
        .loginAs(user)
        .json({ method: 'call' })
      const settings = await user.settings
      response.assertStatus(200)
      expect(response.body.data.recoveryCodes).toHaveLength(10)
      expect(settings.twoFactorAuth.method).toBe('call')
    }
  )

  it.only('Should update notification settings', async ({ client, expect }) => {
    const data = {
      announcement: {
        email: false,
      },
      feature: {
        email: false,
        site: false,
      },
      others: {
        site: false,
      },
    }
    const response = await client.patch('/api/v1/settings/notification').loginAs(user).send(data)
    const settings = await user.settings
    console.log(settings)
    response.assertStatus(200)
    for (key1 in data) {
      for (key2 in data[key1]) {
        expect(data[key1][key2]).toBe(settings.notification[key1][key2])
      }
    }
  })
})
