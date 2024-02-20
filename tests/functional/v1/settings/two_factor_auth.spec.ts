import { test } from '@japa/runner'
import User from 'App/Models/User'
import TwoFactorSettingsResource from 'App/Http/Resources/v1/Settings/TwoFactorSettingsResource'


/*
Run this suit:
node ace test functional --files="v1/settings/two_factor_auth.spec.ts"
*/
test.group('Settings / Two Factor Auth', (group) => {
  test('Should get two factor auth settings', async ({ client }) => {
    const user = await User.factory().create()

    const response = await client.get('/api/v1/settings/two-factor-auth').loginAs(user)
    
    response.assertStatus(200)
    response.assertBodyContains(TwoFactorSettingsResource.make(user))
  })
  
})
