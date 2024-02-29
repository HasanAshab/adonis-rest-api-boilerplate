import { test } from '@japa/runner'
import User from '#app/models/user'
import { extract } from '#app/helpers'
import ListUserResource from '#app/http/resources/v1/user/list_user_resource'
import UserProfileResource from '#app/http/resources/v1/user/user_profile_resource'
import ShowUserResource from '#app/http/resources/v1/user/show_user_resource'
import Mail from '#tests/assertors/mail_assertor'

/*
Run this suits:
node ace test functional --files="v1/users/profile.spec.ts"
*/
test.group('Users / Profile', (group) => {
  let user

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
  })

  test('should get profile', async ({ client }) => {
    const response = await client.get('/api/v1/users/me').loginAs(user)

    log(response.body())
    response.assertStatus(200)
    response.assertBodyContains(UserProfileResource.make(user))
  }).pin()

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
    Mail.fake()
    const email = 'foo@test.com'

    const response = await client.patch('/api/v1/users/me').loginAs(user).json({ email })
    await user.refresh()

    response.assertStatus(200)
    expect(user.email).toBe(email)
    Mail.assertSentTo(email)
  })

  test("Should get other user's profile", async ({ client, expect }) => {
    const otherUser = await User.factory().create()

    const response = await client.get(`/api/v1/users/${otherUser.username}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains(ShowUserResource.make(otherUser))
  })
})
