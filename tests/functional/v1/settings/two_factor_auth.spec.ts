import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import TwoFactorAuthService from '#services/auth/two_factor/two_factor_auth_service'
import TwoFactorSettingsResource from '#resources/v1/settings/two_factor_settings_resource'
import PhoneNumberRequiredException from '#exceptions/phone_number_required_exception'


/*
Run this suit:
node ace test functional --files="v1/settings/two_factor_auth.spec.ts"
*/
test.group('Settings / Two Factor Auth', (group) => {
  const twoFactorAuthService = new TwoFactorAuthService
  
  refreshDatabase(group)

  test('Should get two factor auth settings', async ({ client }) => {
    const user = await User.factory().create()

    const response = await client.get('/api/v1/settings/two-factor-auth').loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyContains(TwoFactorSettingsResource.make(user))
  })
  
  test('Should enable two factor auth', async ({ client, expect }) => {
    const user = await User.factory().create()
    const method = 'authenticator'

    const response = await client.post('/api/v1/settings/two-factor-auth').loginAs(user).json({ method })
    await user.refresh()

    response.assertStatus(200)
    expect(user.hasEnabledTwoFactorAuth()).toBeTrue()
    expect(user.twoFactorMethod).toBe(method)
  })
  
  test('Should not enable two factor auth with method {$self} if user has not phone-number')
  .with(['sms', 'call'])
  .run(async ({ client, expect }, method) => {
    const user = await User.factory().create()

    const response = await client.post('/api/v1/settings/two-factor-auth').loginAs(user).json({ method })
    await user.refresh()

    response.assertStatus(400)
    response.assertBodyContainProperty('errors[0]', {
      code: new PhoneNumberRequiredException().code
    })
    expect(user.hasEnabledTwoFactorAuth()).toBeFalse()
    expect(user.twoFactorMethod).toBeNull()
  })
  
  
  test('Should enable two factor auth with method {$self} if user has phone-number')
  .with(['sms', 'call'])
  .run(async ({ client, expect }, method) => {
    const user = await User.factory().withPhoneNumber().create()

    const response = await client.post('/api/v1/settings/two-factor-auth').loginAs(user).json({ method })
    await user.refresh()

    response.assertStatus(200)
    expect(user.hasEnabledTwoFactorAuth()).toBeTrue()
    expect(user.twoFactorMethod).toBe(method)
  })
  
  test('Should update two factor auth method to authenticator', async ({ client, expect }) => {
    const user = await User.factory().twoFactorAuthEnabled('sms').create()
    const method = 'authenticator'

    const response = await client.patch('/api/v1/settings/two-factor-auth/method').loginAs(user).json({ method })
    await user.refresh()

    response.assertStatus(200)
    expect(user.twoFactorMethod).toBe(method)
  })
  
  test('Should not update two factor auth method to {$self} if user has not phone-number')
  .with(['sms', 'call'])
  .run(async ({ client, expect }, method) => {
    const user = await User.factory().twoFactorAuthEnabled('authenticator').create()

    const response = await client.patch('/api/v1/settings/two-factor-auth/method').loginAs(user).json({ method })
    await user.refresh()

    response.assertStatus(400)
    response.assertBodyContainProperty('errors[0]', {
      code: new PhoneNumberRequiredException().code
    })
    expect(user.twoFactorMethod).toBe('authenticator')
  })
  
  
  test('Should update two factor auth method to {$self} if user has phone-number')
  .with(['sms', 'call'])
  .run(async ({ client, expect }, method) => {
    const user = await User.factory().withPhoneNumber().twoFactorAuthEnabled().create()

    const response = await client.patch('/api/v1/settings/two-factor-auth/method').loginAs(user).json({ method })
    await user.refresh()

    response.assertStatus(200)
    expect(user.twoFactorMethod).toBe(method)
  })
  

  test('Should disable two factor auth', async ({ client, expect }) => {
    const user = await User.factory().twoFactorAuthEnabled().create()

    const response = await client.delete('/api/v1/settings/two-factor-auth').loginAs(user)
    await user.refresh()

    response.assertStatus(200)
    expect(user.hasEnabledTwoFactorAuth()).toBeFalse()
  })
  
  test('Should get two factor auth QR Code SVG', async ({ client }) => {
    const user = await User.factory().twoFactorAuthEnabled().create()

    const response = await client.get('/api/v1/settings/two-factor-auth/qr-code').loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyHaveProperty('data', await user.twoFactorQrCodeSvg())
  })
  
  test('Should get two factor auth recovery codes', async ({ client }) => {
    const user = await User.factory().twoFactorAuthEnabled().create()
    await twoFactorAuthService.generateRecoveryCodes(user)

    const response = await client.get('/api/v1/settings/two-factor-auth/recovery-codes').loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyHaveProperty('data', user.recoveryCodes())
  })
  
  test('Should generate new two factor auth recovery codes', async ({ client, expect }) => {
    const user = await User.factory().create()
    await twoFactorAuthService.generateRecoveryCodes(user)
    const oldCodes = user.recoveryCodes()
    
    const response = await client.post('/api/v1/settings/two-factor-auth/recovery-codes').loginAs(user)
    await user.refresh()
    const newCodes = user.recoveryCodes()

    response.assertStatus(200)
    response.assertBodyHaveProperty('data', newCodes)
    expect(oldCodes).not.toEqual(newCodes)
  })
})
