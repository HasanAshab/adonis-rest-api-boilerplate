import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import TwoFactorAuthService from '#services/auth/two_factor/two_factor_auth_service'
import { UserFactory } from '#factories/user_factory'
import Token from '#models/token'
import twilio from '#ioc/twilio'
import TwoFactorAuthRequiredException from '#exceptions/two_factor_auth_required_exception'
import PhoneNumberRequiredException from '#exceptions/phone_number_required_exception'
import Otp from '#services/auth/otp'
import { authenticator } from 'otplib'

/*
Run this suits:
node ace test functional --files="v1/auth/two_factor.spec.ts"
*/
test.group('Auth/TwoFactor', (group) => {
  const twoFactorAuthService = new TwoFactorAuthService()

  refreshDatabase(group)

  group.each.setup(() => {
    twilio.fake()
  })

  test('should recover account with valid recovery code', async ({ client }) => {
    const user = await UserFactory.apply('twoFactorAuthenticableThroughAuthenticator').create()
    const [code] = await twoFactorAuthService.generateRecoveryCodes(user, 1)

    const response = await client.post('/api/v1/auth/two-factor/recover').json({
      email: user.email,
      code,
    })

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.token')
  })

  test("shouldn't recover account with same recovery code", async ({ client }) => {
    const user = await UserFactory.apply('twoFactorAuthenticableThroughAuthenticator').create()
    const [code] = await twoFactorAuthService.generateRecoveryCodes(user, 1)
    const data = {
      email: user.email,
      code,
    }

    const response1 = await client.post('/api/v1/auth/two-factor/recover').json(data)
    const response2 = await client.post('/api/v1/auth/two-factor/recover').json(data)

    response1.assertStatus(200)
    response2.assertStatus(401)
    response1.assertBodyHaveProperty('data.token')
    response2.assertBodyNotHaveProperty('data.token')
  })

  test("shouldn't recover account with invalid recovery code", async ({ client }) => {
    const user = await UserFactory.apply('twoFactorAuthenticableThroughAuthenticator').create()
    await twoFactorAuthService.generateRecoveryCodes(user, 1)

    const response = await client.post('/api/v1/auth/two-factor/recover').json({
      email: user.email,
      code: 'foo-bar',
    })

    response.assertStatus(401)
    response.assertBodyNotHaveProperty('data.token')
  })

  test('Should not send otp without token', async ({ client }) => {
    const { email } = await UserFactory.apply('hasPhoneNumber').apply('twoFactorAuthenticableThroughAuthenticator').create()

    const response = await client.post(`/api/v1/auth/two-factor/challenges`).json({ email })

    response.assertStatus(422)
  })

  test('Should send otp through {$self}')
    .with(['Sms', 'Call'])
    .run(async ({ client }, method) => {
      const user = await UserFactory.apply('hasPhoneNumber').apply(`twoFactorAuthenticableThrough${method}`).create()
      const token = await new TwoFactorAuthRequiredException(user).challengeToken()

      const response = await client.post(`/api/v1/auth/two-factor/challenges`).json({
        email: user.email,
        token,
      })

      response.assertStatus(200)
      if (method === 'Sms') {
        twilio.assertMessaged(user.phoneNumber)
      } else {
        twilio.assertCalled(user.phoneNumber)
      }
    })

  test('Should not send otp through {$self} to phone numberless user')
    .with(['Sms', 'Call'])
    .run(async ({ client }, method) => {
      const user = await UserFactory.apply(`twoFactorAuthenticableThrough${method}`).create()
      const token = await new TwoFactorAuthRequiredException(user).challengeToken()

      const response = await client.post(`/api/v1/auth/two-factor/challenges`).json({
        email: user.email,
        token,
      })

      response.assertStatus(400)
      response.assertBodyContainProperty('errors[0]', {
        code: new PhoneNumberRequiredException().code,
      })
    })

  test('Should not verify challenge without token', async ({ client }) => {
    const user = await UserFactory.apply('hasPhoneNumber').apply('twoFactorAuthenticableThroughAuthenticator').create()
    const code = authenticator.generate(user.twoFactorSecret)

    const response = await client
      .post('/api/v1/auth/two-factor/challenges/verification')
      .deviceId('device-id')
      .json({
        email: user.email,
        code,
        trustThisDevice: false,
      })

    response.assertStatus(422)
  })

  test('should verify challenge of method {$self} with valid otp')
    .with(['Authenticator', 'Sms', 'Call'])
    .run(async ({ client }, method) => {
      const user = await UserFactory.apply('hasPhoneNumber').apply(`twoFactorAuthenticableThrough${method}`).create()
      const token = await new TwoFactorAuthRequiredException(user).challengeVerificationToken()
      const code =
        method === 'Authenticator'
          ? authenticator.generate(user.twoFactorSecret)
          : await new Otp().generate(user.twoFactorSecret)

      const response = await client
        .post('/api/v1/auth/two-factor/challenges/verification')
        .deviceId('device-id')
        .json({
          email: user.email,
          code,
          token,
          trustThisDevice: false,
        })

      response.assertStatus(200)
      response.assertBodyHaveProperty('data.token')
    })

  test('should login user of {$self} method with invalid otp')
    .with(['Sms', 'Call'])
    .run(async ({ client }, method) => {
      const user = await UserFactory.apply('hasPhoneNumber').apply(`twoFactorAuthenticableThrough${method}`).create()
      const token = await new TwoFactorAuthRequiredException(user).challengeVerificationToken()

      const response = await client
        .post('/api/v1/auth/two-factor/challenges/verification')
        .deviceId('device-id')
        .json({
          email: user.email,
          code: '123456',
          token,
          trustThisDevice: false,
        })

      response.assertStatus(401)
      response.assertBodyNotHaveProperty('data.token')
    })

  //todo
  test('should mark device as trusted when flagged for and otp is valid', async ({
    client,
    expect,
  }) => {
    const user = await UserFactory.apply('hasPhoneNumber').apply(`twoFactorAuthenticableThrough${method}`).create()
    const token = await new TwoFactorAuthRequiredException(user).challengeVerificationToken()
    const code = authenticator.generate(user.twoFactorSecret)

    const response = await client
      .post('/api/v1/auth/two-factor/challenges/verification')
      .deviceId('device-id')
      .json({
        email: user.email,
        code,
        token,
        trustThisDevice: true,
      })

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.token')
    await expect(user.isDeviceTrusted('device-id')).resolves.toBeTrue()
  })

  test('should not mark device as trusted when not flagged for and otp is valid', async ({
    client,
    expect,
  }) => {
    const user = await UserFactory.apply('hasPhoneNumber').apply(`twoFactorAuthenticableThrough${method}`).create()
    const token = await new TwoFactorAuthRequiredException(user).challengeVerificationToken()
    const code = authenticator.generate(user.twoFactorSecret)

    const response = await client
      .post('/api/v1/auth/two-factor/challenges/verification')
      .deviceId('device-id')
      .json({
        email: user.email,
        code,
        token,
        trustThisDevice: false,
      })

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.token')
    await expect(user.isDeviceTrusted('device-id')).resolves.toBeFalse()
  })

  test('should not mark device as trusted when flagged for and otp is invalid', async ({
    client,
    expect,
  }) => {
    const user = await UserFactory.apply('hasPhoneNumber').apply(`twoFactorAuthenticableThrough${method}`).create()
    const token = await new TwoFactorAuthRequiredException(user).challengeVerificationToken()

    const response = await client
      .post('/api/v1/auth/two-factor/challenges/verification')
      .deviceId('device-id')
      .json({
        email: user.email,
        code: '123456',
        token,
        trustThisDevice: true,
      })
    response.assertStatus(401)
    response.assertBodyNotHaveProperty('data.token')
    await expect(user.isDeviceTrusted('device-id')).resolves.toBeFalse()
  })
})
