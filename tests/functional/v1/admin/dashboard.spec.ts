import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'

/*
Run this suits:
node ace test functional --files="v1/admin/dashboard.spec.ts"
*/
test.group('Admin / Dashboard', (group) => {
  refreshDatabase(group)

  test("Users shouldn't get admin dashboard", async ({ client, expect }) => {
    const user = await UserFactory.create()

    const response = await client.get('/api/v1/admin/dashboard').loginAs(user)

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })

  test('Admin should get dashboard', async ({ client, expect }) => {
    const admin = await UserFactory.withRole('admin').create()
    const todayUser = await UserFactory.createMany(2)
    const oldUser = await UserFactory.count(3).registeredBefore('1 day').create()

    const response = await client.get('/api/v1/admin/dashboard').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        totalUsers: todayUser.length + oldUser.length,
        newUsersToday: todayUser.length,
      },
    })
  })
})
