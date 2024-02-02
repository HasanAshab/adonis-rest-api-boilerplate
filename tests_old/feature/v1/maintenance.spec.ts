import Config from 'Config'

describe('App', () => {
  beforeAll(() => {
    Config.set({ app: { state: 'down' } })
  })

  test("shouldn't accessable when in maintenance mode", async ({ client, expect }) => {
    const response = await client.get('/api/v1/')
    response.assertStatus(503)
  })

  test("shouldn't accessable with invalid bypass key when in maintenance mode", async ({
    client,
    expect,
  }) => {
    const response = await client.get('/api/v1/').query({ bypassKey: 'foo-invalid-key' })
    response.assertStatus(503)
  })

  test('should accessable with valid bypass key when in maintenance mode', async ({
    client,
    expect,
  }) => {
    const response = await client.get('/api/v1/').query({ bypassKey: Config.get('app.key') })
    response.assertStatus(404)
  })
})
