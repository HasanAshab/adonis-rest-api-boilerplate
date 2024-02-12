import { test } from '@japa/runner'
import User from 'App/Models/User'


/*
Run this suit:
node ace test functional --files="v1/settings/get.spec.ts"
*/
test.group('Settings / Get', (group) => {

  test('Should get settings', async ({ client }) => {
    const user = await User.factory().hasSettings().create()
    await user.load('settings')
    
    const response = await client.get('/api/v1/settings').loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyHaveProperty('data', user.settings.toJSON())
  })
})
