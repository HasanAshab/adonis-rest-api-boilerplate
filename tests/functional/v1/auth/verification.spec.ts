import { test } from '@japa/runner'
import User from 'App/Models/User'
import EmailVerificationMail from 'App/Mails/EmailVerificationMail'
import Mail from 'Tests/Assertors/MailAssertor'

/*
Run this suits:
node ace test functional --files="v1/auth/verification.spec.ts"
*/
test.group('Auth / Verification', (group) => {
  let user

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().unverified().create()
  })

  test('should verify email', async ({ client, expect }) => {
    const token = await new EmailVerificationMail(user, 'v1').verificationToken()
    
    const response = await client.post('api/v1/auth/verification').json({
      id: user.id,
      token
    })
    await user.refresh()

    response.assertStatus(200)
    expect(user.verified).toBeTrue()
  })

  test("shouldn't verify email without token", async ({ client, expect }) => {
    const response = await client.post('api/v1/auth/verification').json({
      id: user.id
    })
    await user.refresh()

    response.assertStatus(422)
    expect(user.verified).toBeFalse()
  })
  
  
  test('should resend verification email', async ({ client }) => {
    Mail.fake()

    const response = await client.post('/api/v1/auth/verification/notification').json({
      email: user.email,
    })

    response.assertStatus(202)
    Mail.assertSentTo(user.email)
  })

  test("shouldn't resend verification email when no user found", async ({ client }) => {
    Mail.fake()
    const email = 'test@gmail.com'

    const response = await client.post('/api/v1/auth/verification/notification').json({ email })

    response.assertStatus(202)
    Mail.assertNotSentTo(user.email)
  })
})
