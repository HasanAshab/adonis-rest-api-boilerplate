import { test } from '@japa/runner'
import { refreshDatabase, fakeFilePath } from '#tests/helpers'
import User from '#models/user'
import { extract } from '#app/helpers'
import mail from '@adonisjs/mail/services/main'
import EmailVerificationMail from '#mails/email_verification_mail'

/*
Run this suits:
node ace test functional --files="v1/users/profile.spec.ts"
*/
test.group('Users / Profile', (group) => {
  let user: User

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
  })

  test('should get profile', async ({ client }) => {
    const response = await client.get('/api/v1/users/me').loginAs(user)

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.id', user.id)
  })

  test('should update profile', async ({ client, expect }) => {
    const username = 'newName'

    const response = await client
      .patch('/api/v1/users/me')
      .loginAs(user)
      .field('username', username)
      .file('profile', fakeFilePath('image.png'))
    await user.refresh()

    response.assertStatus(200)
    expect(user.username).toBe(username)
  })

  test("Shouldn't update profile with existing username", async ({ client, expect }) => {
    const existingUser = await User.factory().create()
    const oldUsername = user.username

    const response = await client
      .patch('/api/v1/users/me')
      .loginAs(user)
      .json(extract(existingUser, 'username'))
    await user.refresh()

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [{ field: 'username' }],
    })
    expect(user.username).toBe(oldUsername)
  })

  test("Shouldn't update profile with existing email", async ({ client, expect }) => {
    const existingUser = await User.factory().create()
    const oldEmail = user.email

    const response = await client
      .patch('/api/v1/users/me')
      .loginAs(user)
      .json(extract(existingUser, 'email'))
    await user.refresh()

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [{ field: 'email' }],
    })
    expect(user.email).toBe(oldEmail)
  })

  test('updating email should send verification email', async ({ client, expect }) => {
    const { mails } = mail.fake()
    const email = 'foo@test.com'

    const response = await client.patch('/api/v1/users/me').loginAs(user).json({ email })
    await user.refresh()

    response.assertStatus(200)
    expect(user.email).toBe(email)
    mails.assertQueued(EmailVerificationMail, ({ message }) => {
      return message.hasTo(user.email)
    })
  })

  test("Should get other user's profile", async ({ client }) => {
    const otherUser = await User.factory().create()

    const response = await client.get(`/api/v1/users/${otherUser.username}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.id', otherUser.id)
  })
})
