import { test } from '@japa/runner'
import User from '#app/models/user'

/*
Run this suits:
node ace test functional --files="v1/auth/logout.spec.ts"
*/
test.group('Auth / Logout', (group) => {
  test('API token should be invalid after logout', async ({ client, expect }) => {
    const user = await User.factory().hasSettings().create()
    const { token } = await user.createToken()

    const response = await client.post('/api/v1/auth/logout').bearerToken(token)
    const responseAfterLogout = await client.post('/api/v1/auth/logout').bearerToken(token)

    expect(response.status()).toBe(200)
    expect(responseAfterLogout.status()).toBe(401)
  })
})
