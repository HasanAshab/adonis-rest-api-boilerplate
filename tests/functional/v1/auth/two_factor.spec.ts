import { test } from '@japa/runner'
import User from '#app/models/user'
import TwoFactorAuthService from '#app/services/auth/two_factor/two_factor_auth_service'
import Token from '#app/models/token'
import Twilio from '@ioc:adonis/addons/twilio'
import TwoFactorAuthRequiredException from '#app/exceptions/two_factor_auth_required_exception'
import PhoneNumberRequiredException from '#app/exceptions/phone_number_required_exception'
import Otp from '#app/services/auth/otp'
import { authenticator } from 'otplib';


/*
Run this suits:
node ace test functional --files="v1/auth/two_factor.spec.ts"
*/
test.group('Auth/TwoFactor', (group) => {
  const twoFactorAuthService = new TwoFactorAuthService()
  let user: User
  let token: string

  refreshDatabase(group)
  

  group.each.setup(() => {
    Twilio.fake()
  })
  
  test('should recover account with valid recovery code', async ({ client }) => {
    const user = await User.factory().twoFactorAuthEnabled().create()
    const [code] = await twoFactorAuthService.generateRecoveryCodes(user, 1)
    
    const response = await client.post('/api/v1/auth/two-factor/recover').json({
      email: user.email,
      code
    })

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.token')
  })

  test("shouldn't recover account with same recovery code", async ({ client }) => {
    const user = await User.factory().twoFactorAuthEnabled().create()
    const [code] = await twoFactorAuthService.generateRecoveryCodes(user, 1)
    const data = { 
      email: user.email,
      code 
    }

    const response1 = await client.post('/api/v1/auth/two-factor/recover').json(data)
    const response2 = await client.post('/api/v1/auth/two-factor/recover').json(data)

    response1.assertStatus(200)
    response2.assertStatus(401)
    response1.assertBodyHaveProperty('data.token')
    response2.assertBodyNotHaveProperty('data.token')
  })

  test("shouldn't recover account with invalid recovery code", async ({ client }) => {
    const user = await User.factory().twoFactorAuthEnabled().create()
    await twoFactorAuthService.generateRecoveryCodes(user, 1)

    const response = await client.post('/api/v1/auth/two-factor/recover').json({
      email: user.email,
      code: 'foo-bar',
    })
    
    response.assertStatus(401)
    response.assertBodyNotHaveProperty('data.token')
  })


  test('Should not send otp without token', async ({ client }) => {
    const { email } = await User.factory().withPhoneNumber().twoFactorAuthEnabled().create()

    const response = await client.post(`/api/v1/auth/two-factor/challenges`).json({ email })

    response.assertStatus(422)
  })
  
  test('Should send otp through {$self}') 
  .with(['sms', 'call'])
  .run(async ({ client }, method) => {
    const user = await User.factory().withPhoneNumber().twoFactorAuthEnabled(method).create()
    const token = await new TwoFactorAuthRequiredException(user).challengeToken()

    const response = await client.post(`/api/v1/auth/two-factor/challenges`)
      .json({
        email: user.email,
        token
      })

    response.assertStatus(200)
    if(method === 'sms') {
      Twilio.assertMessaged(user.phoneNumber)
    }
    else {
      Twilio.assertCalled(user.phoneNumber)
    }
  })

  test('Should not send otp through {$self} to phone numberless user') 
  .with(['sms', 'call'])
  .run(async ({ client }, method) => {
    const user = await User.factory().twoFactorAuthEnabled(method).create()
    const token = await new TwoFactorAuthRequiredException(user).challengeToken()

    const response = await client.post(`/api/v1/auth/two-factor/challenges`)
      .json({
        email: user.email,
        token
      })

    response.assertStatus(400)
    response.assertBodyContainProperty('errors[0]', {
      code: new PhoneNumberRequiredException().code
    })
  })

  test('Should not verify challenge without token', async ({ client }) => {
    const user = await User.factory().withPhoneNumber().twoFactorAuthEnabled().create()
    const challengeToken = authenticator.generate(user.twoFactorSecret)

    const response = await client.post('/api/v1/auth/two-factor/challenges/verification').json({
      email: user.email,
      challengeToken
    })

    response.assertStatus(422)
  })

  test('should verify challenge of method {$self} with valid challenge token')
  .with(['authenticator', 'sms', 'call'])
  .run(async ({ client }, method) => {
    const user = await User.factory().withPhoneNumber().twoFactorAuthEnabled(method).create()
    const token = await new TwoFactorAuthRequiredException(user).challengeVerificationToken()

    const challengeToken = method === 'authenticator'
      ? authenticator.generate(user.twoFactorSecret)
      : await Otp.generate(user.twoFactorSecret)

    const response = await client.post('/api/v1/auth/two-factor/challenges/verification').json({
      email: user.email,
      challengeToken
      token
    })

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.token')
  })
  

  test('should login user of method {$self} with valid otp')
  .with(['sms', 'call'])
  .run(async ({ client }, method) => {
    const user = await User.factory().withPhoneNumber().twoFactorAuthEnabled(method).create()
    const token = await new TwoFactorAuthRequiredException(user).challengeVerificationToken()

    const response = await client.post('/api/v1/auth/two-factor/challenges/verification').json({
      email: user.email,
      challengeToken: '123456',
      token
    })

    response.assertStatus(401)
    response.assertBodyNotHaveProperty('data.token')
  })
})
