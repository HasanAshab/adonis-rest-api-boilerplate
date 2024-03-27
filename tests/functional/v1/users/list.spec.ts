import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import { extract } from '#app/helpers'

/*
Run this suits:
node ace test functional --files="v1/users/list.spec.ts"
*/
test.group('Users / List', (group) => {
  refreshDatabase(group)

  test('Should list users', async ({ client }) => {
    const [admin, users] = await Promise.all([
      UserFactory.withRole('admin').create(),
      UserFactory.createMany(2),
    ])

    const response = await client.get('/api/v1/users').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContainProperty('data', extract(users, 'id'))
  })

  test("User shouldn't get users list", async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/api/v1/users').loginAs(user)

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })
})
