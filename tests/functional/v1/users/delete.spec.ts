import { test } from '@japa/runner'
import User from 'App/Models/User'

/*
Run this suits:
node ace test functional --files="v1/users/delete.spec.ts"
*/
test.group('Users/Delete', (group) => {
  let user

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
  })

  test('Should delete own account', async ({ client, expect }) => {
    const user = await User.factory().create()

    const response = await client.delete(`/api/v1/users/me`).loginAs(user)

    response.assertStatus(204)
    await expect(user.exists()).resolves.toBe(false)
  })

  test("User shouldn't delete others", async ({ client, expect }) => {
    const anotherUser = await User.factory().create()

    const response = await client.delete(`/api/v1/users/${anotherUser.id}`).loginAs(user)

    response.assertStatus(403)
    await expect(anotherUser.exists()).resolves.toBe(true)
  })
  
  test('Admin should delete user', async ({ client, expect }) => {
    const admin = await User.factory().withRole('admin').create()

    const response = await client.delete(`/api/v1/users/${user.id}`).loginAs(admin)

    response.assertStatus(204)
    await expect(user.exists()).resolves.toBe(false)
  })

  test("Admins shouldn't delete each other", async ({ client, expect }) => {
    const [admin, anotherAdmin] = await User.factory().count(2).withRole('admin').create()

    const response = await client.delete(`/api/v1/users/${anotherAdmin.id}`).loginAs(admin)

    response.assertStatus(403)
    await expect(anotherAdmin.exists()).resolves.toBe(true)
  })
})
