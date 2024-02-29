import { test } from '@japa/runner'
import User from '#app/models/user'
import { DateTime } from 'luxon'

/*
Run this suits:
node ace test functional --files="v1/admin/dashboard.spec.ts"
*/
test.group('Admin / Dashboard', (group) => {
  refreshDatabase(group)

  test("Users shouldn't get admin dashboard", async ({ client, expect }) => {
    const user = await User.factory().create()

    const response = await client.get('/api/v1/admin/dashboard').loginAs(user)

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })

  test('Admin should get dashboard', async ({ client, expect }) => {
    const [admin, todayUser, oldUser] = await Promise.all([
      User.factory().withRole('admin').create(),
      User.factory().count(2).create(),
      User.factory()
        .count(3)
        .create({
          createdAt: DateTime.local().minus({ days: 1 }),
        }),
    ])

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
