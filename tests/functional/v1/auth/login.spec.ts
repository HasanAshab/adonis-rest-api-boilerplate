import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'

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
    const limit = 10
    const responses = []
    const payload = {
      email: user.email,
      password: 'wrong-pass',
    }
    
    let z =0
    for (let i = 0; i < limit; i++) {
      log('yo', z++)

      const response = await client.post('/api/v1/auth/login').json(payload)
      responses.push(response)
    }

    const lockedResponse = await client.post('/api/v1/auth/login').json(payload)

    responses.forEach(response => {
      response.assertStatus(401)
    })
    lockedResponse.assertStatus(429)
  }).pin()

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
