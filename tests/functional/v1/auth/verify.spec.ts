import { test } from '@japa/runner'
import User from 'App/Models/User'
import EmailVerificationMail from 'App/Mails/EmailVerificationMail'
import Mail from '@ioc:Adonis/Addons/Mail'

/*
Run this suits:
node ace test functional --files="v1/auth/verify.spec.ts"
*/
test.group('Auth/Verify', (group) => {
  let user

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().unverified().create()
  })

  test('should verify email', async ({ client, expect }) => {
    const token = await new EmailVerificationMail(user, 'v1').verificationToken()
    
    const response = await client.post('api/v1/auth/verify').json({
      id: user.id,
      token
    })
    await user.refresh()

    response.assertStatus(200)
    expect(user.verified).toBeTrue()
  })

  test("shouldn't verify email with invalid token", async ({ client, expect }) => {
    const response = await client.post('api/v1/auth/verify').json({
      id: user.id,
      token: 'invalid-token'
    })
    await user.refresh()

    response.assertStatus(401)
    expect(user.verified).toBeFalse()
  })
  
  
  test('should resend verification email', async ({ client, expect }) => {
    const mailer = Mail.fake()

    const response = await client.post('/api/v1/auth/verify/resend').json({
      email: user.email,
    })

    response.assertStatus(202)
    expect(mailer.exists((mail) => mail.to[0].address === user.email)).toBeTrue()
  })

  test("shouldn't resend verification email when no user found", async ({ client, expect }) => {
    const mailer = Mail.fake()
    const email = 'test@gmail.com'

    const response = await client.post('/api/v1/auth/verify/resend').json({ email })

    response.assertStatus(202)
    expect(mailer.exists((mail) => mail.to[0].address === email)).toBeFalse()
  })
})
