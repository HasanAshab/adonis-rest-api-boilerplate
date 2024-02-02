import { test } from '@japa/runner'
import User from 'App/Models/User'
import { extract } from 'App/helpers'
import ListUserResource from 'App/Http/Resources/v1/user/ListUserResource'

/*
Run this suits:
node ace test functional --files="v1/users/list.spec.ts"
*/
test.group('Users / List', (group) => {
  refreshDatabase(group)

  test('Should list users', async ({ client }) => {
    const [admin, users] = await Promise.all([
      User.factory().withRole('admin').create(),
      User.factory().count(2).create(),
    ])

    const response = await client.get('/api/v1/users').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains(ListUserResource.collection(users).toJSON())
  })

  test("User shouldn't get users list", async ({ client }) => {
    const user = await User.factory().create()

    const response = await client.get('/api/v1/users').loginAs(user)

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })
})
