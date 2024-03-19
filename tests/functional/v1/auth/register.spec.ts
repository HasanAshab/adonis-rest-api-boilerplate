import { test } from '@japa/runner'
import { refreshDatabase, fakeFilePath } from '#tests/helpers'
import { omit, pick } from 'lodash-es'
import emitter from '@adonisjs/core/services/emitter'
import User from '#models/user'
import Registered from '#events/registered'

/*
Run this suits:
node ace test functional --files="v1/auth/register.spec.ts"
*/
test.group('Auth / Register', (group) => {
  refreshDatabase(group)

  test('should register a user', async ({ expect, client }) => {
    const events = emitter.fake()
    const payload = {
      username: 'foobar123',
      email: 'foo@gmail.com',
      password: 'Password@1234',
    }

    const response = await client.post('/api/v1/auth/register').json(payload)
    const user = await User.findByFields(omit(payload, 'password'))

    response.assertStatus(201)
    response.assertBodyHaveProperty('data.token')
    expect(user).not.toBeNull()
    events.assertEmitted(Registered, ({ data }) => {
      return data.version === 'v1' && data.method === 'internal' && data.user.id === user.id
    })
  })

  test('should register a user with avatar', async ({ client, expect }) => {
    const events = emitter.fake()
    const payload = {
      username: 'foobar123',
      email: 'foo@gmail.com',
      password: 'Password@1234',
    }

    const response = await client
      .post('/api/v1/auth/register')
      .file('avatar', fakeFilePath('image.png'))
      .fields(payload)

    const user = await User.findByFields(omit(payload, 'password'))

    response.assertStatus(201)
    response.assertBodyHaveProperty('data.token')
    expect(user).not.toBeNull()
    expect(user.avatar).not.toBeNull()

    events.assertEmitted(Registered, ({ data }) => {
      return data.version === 'v1' && data.method === 'internal' && data.user.id === user.id
    })
  })

  test("shouldn't register with existing email", async ({ client }) => {
    const events = emitter.fake()
    const user = await User.factory().create()

    const response = await client.post('/api/v1/auth/register').json({
      username: 'foo',
      email: user.email,
      password: 'Password@1234',
    })

    response.assertStatus(422)
    response.assertBodyNotHaveProperty('token')
    events.assertNoneEmitted()
  })

  test("shouldn't register with existing username", async ({ client }) => {
    const events = emitter.fake()
    const user = await User.factory().create()

    const response = await client.post('/api/v1/auth/register').json({
      username: user.username,
      email: 'foo@test.com',
      password: 'Password@1234',
    })

    response.assertStatus(422)
    response.assertBodyNotHaveProperty('data')
    events.assertNoneEmitted()
  })
})
