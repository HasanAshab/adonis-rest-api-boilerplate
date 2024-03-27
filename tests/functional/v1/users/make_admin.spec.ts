import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import type User from '#models/user'
import { UserFactory } from '#factories/user_factory'


/*
Run this suits:
node ace test functional --files="v1/users/make_admin.spec.ts"
*/
test.group('Users / MakeAdmin', (group) => {
  let user: User

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await UserFactory.create()
  })

  test('Should make admin', async ({ client, expect }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.patch(`/api/v1/users/${user.id}/admin`).loginAs(admin)
    await user.refresh()

    response.assertStatus(200)
    expect(user.role).toBe('admin')
  })

  test("User Should't make others admin", async ({ client, expect }) => {
    const anotherUser = await UserFactory.create()

    const response = await client.patch(`/api/v1/users/${anotherUser.id}/admin`).loginAs(user)
    await anotherUser.refresh()

    response.assertStatus(403)
    expect(anotherUser.role).toBe('user')
  })
})
