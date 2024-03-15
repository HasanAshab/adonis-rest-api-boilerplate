import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import app from '@adonisjs/core/services/app'
import { HttpContext } from '@adonisjs/core/http'


/*
Run this suits:
node ace test functional --files="v1/auth/social.spec.ts"
*/
test.group('Auth / Social', (group) => {
  let user: User

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
  })
  
  test('Should pass username to SocialAuthService when provided', async ({ client }) => {
    HttpContext.getter('ally', () => {
      return {
        use: () => ({
          userFromToken: () => ({
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            emailVerificationState: 'verified',
          })
        })
      }
    })
    
    const response = await client.post('/api/v1/auth/login/social/google').json({
      username: 'test',
      token: 'token'
    })
    
    response.assertStatus(201)
    
    // app.container.swap(UserService, () => {
//     return new FakeService()
//   })
  
  })


  
})