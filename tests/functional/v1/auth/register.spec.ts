import { test } from '@japa/runner'
import { omit, pick } from 'lodash-es'
import User from '#models/user'
import Event from '#tests/assertors/event_assertor'

/*
Run this suits:
node ace test functional --files="v1/auth/register.spec.ts"
*/
test.group('Auth / Register', (group) => {
  refreshDatabase(group)

  group.setup(async () => {
    Event.fake()
  })

  test('should register a user', async ({ expect, client }) => {
    const data = {
      username: 'foobar123',
      email: 'foo@gmail.com',
      password: 'Password@1234',
    }

    const response = await client.post('/api/v1/auth/register').json(data)

    const user = await User.query().whereEqual(omit(data, 'password')).preload('settings').first()
    expect(response.status()).toBe(201)
    expect(response.body()).toHaveProperty('data.token')
    expect(user).not.toBeNull()
    expect(user.settings).not.toBeNull()

    Event.assertDispatchedContain('registered', {
      version: 'v1',
      method: 'internal',
      user: pick(user, 'id'),
    })
  })

  test('should register a user with avatar', async ({ expect, client }) => {
    const data = {
      username: 'foobar123',
      email: 'foo@gmail.com',
      password: 'Password@1234',
    }

    const response = await client
      .post('/api/v1/auth/register')
      .file('avatar', fakeFilePathPath('image.png'))
      .fields(data)

    const user = await User.query().whereEqual(omit(data, 'password')).preload('settings').first()

    expect(response.status()).toBe(201)
    expect(response.body()).toHaveProperty('data.token')
    expect(user).not.toBeNull()
    expect(user.avatar).not.toBeNull()
    expect(user.settings).not.toBeNull()

    Event.assertDispatchedContain('registered', {
      version: 'v1',
      method: 'internal',
      user: pick(user, 'id'),
    })
  })

  test("shouldn't register with existing email", async ({ client, expect }) => {
    const user = await User.factory().create()

    const response = await client.post('/api/v1/auth/register').json({
      username: 'foo',
      email: user.email,
      password: 'Password@1234',
    })

    expect(response.status()).toBe(422)
    expect(response.body()).not.toHaveProperty('token')
  })

  test("shouldn't register with existing username", async ({ client, expect }) => {
    const user = await User.factory().create()

    const response = await client.post('/api/v1/auth/register').json({
      username: user.username,
      email: 'foo@test.com',
      password: 'Password@1234',
    })

    expect(response.status()).toBe(422)
    expect(response.body()).not.toHaveProperty('data')
  })
})
