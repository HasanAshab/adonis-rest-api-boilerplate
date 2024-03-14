import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import ResetPasswordMail from '#mails/reset_password_mail'
import PasswordChangedMail from '#mails/password_changed_mail'
import { Settings } from 'luxon'


/*
Run this suits:
node ace test functional --files="v1/auth/password.spec.ts"
*/
test.group('Auth / Password', (group) => {
  let user: User

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
  })

  test('Should send reset email', async ({ client }) => {
    const { mails } = mail.fake()
    
    const response = await client.post('/api/v1/auth/password/forgot').json({
      email: user.email
    })

    response.assertStatus(202)
    mails.assertQueued(ResetPasswordMail, ({ message }) => {
      return message.hasTo(user.email)
    })
  })

  test("Shouldn't send reset email when no user found", async ({ client, expect }) => {
    const { mails } = mail.fake()
    
    const response = await client.post('/api/v1/auth/password/forgot').json({ 
      email: 'test@gmail.com'
    })

    response.assertStatus(202)
    mails.assertNoneQueued()
  })

  test("Shouldn't send reset email to unverified account", async ({ client, expect }) => {
    const { mails } = mail.fake()
    const { email } = await User.factory().unverified().create()

    const response = await client.post('/api/v1/auth/password/forgot').json({ email })

    response.assertStatus(202)
    mails.assertNoneQueued()
  })
  
  test("Shouldn't send reset email to social account", async ({ client, expect }) => {
    const { mails } = mail.fake()
    const { email } = await User.factory().social().create()

    const response = await client.post('/api/v1/auth/password/forgot').json({ email })

    response.assertStatus(202)
    mails.assertNoneQueued()
  })

  test('should reset password', async ({ client, expect }) => {
    const { mails } = mail.fake()
    const token = await new ResetPasswordMail(user).resetToken()
    const password = 'Password@1234'

    const response = await client.patch('/api/v1/auth/password/reset').json({ 
      id: user.id,
      password,
      token
    })
    await user.refresh()

    response.assertStatus(200)
    mails.assertQueued(PasswordChangedMail, ({ message }) => {
      return message.hasTo(user.email)
    })

    expect(await user.comparePassword(password)).toBeTrue()
  })

  test("shouldn't reset password without token", async ({ client, expect }) => {
    const { mails } = mail.fake()
    const password = 'Password@1234'

    const response = await client.patch('/api/v1/auth/password/reset').json({ 
      id: user.id,
      password
    })
    await user.refresh()

    response.assertStatus(422)
    mails.assertNoneQueued()
    expect(await user.comparePassword(password)).toBeFalse()
  })
})
