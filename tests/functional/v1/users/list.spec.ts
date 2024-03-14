import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import { extract } from '#app/helpers'
import ListUserResource from '#resources/v1/user/list_user_resource'

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
    log(response.body().data)
    response.assertStatus(200)
    response.assertBodyContains(ListUserResource.collection(users))
  })

  test("User shouldn't get users list", async ({ client }) => {
    const user = await User.factory().create()

    const response = await client.get('/api/v1/users').loginAs(user)

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })
})
