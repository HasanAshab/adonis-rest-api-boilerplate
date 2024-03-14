import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'

/*
Run this suits:
node ace test functional --files="v1/auth/logout.spec.ts"
*/
test.group('Auth / Logout', (group) => {
  test('API token should be invalid after logout', async ({ client, expect }) => {
    const user = await User.factory().create()
    const token = await user.createToken()
    const response = await client.post('/api/v1/auth/logout').bearerToken(token.value.release())
    const responseAfterLogout = await client.post('/api/v1/auth/logout').bearerToken(token)

    response.assertStatus(200)
    responseAfterLogout.assertStatus(401)
  })
})
