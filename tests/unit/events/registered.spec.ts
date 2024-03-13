import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import Mail from '#tests/assertors/mail_assertor'
import Notification from '#tests/assertors/notification_assertor'
import SendEmailVerificationMail from '#listeners/send_email_verification_mail'
import SendNewUserJoinedNotificationToAdmins from '#listeners/send_new_user_joined_notification_to_admins'

/*
Run this suits:
node ace test unit --files="events/registered.spec.ts"
*/
test.group('Events / Registered', (group) => {
  let user

  group.setup(async () => {
    user = await User.factory().unverified().create()
  })

  group.each.setup(() => {
    Mail.fake()
    Notification.fake()
  })

  test('should send verification email on internal method', async ({ expect }) => {
    await new SendEmailVerificationMail().dispatch({
      user,
      version: 'v1',
      method: 'internal',
    })

    Mail.assertSentTo(user.email)
  })

  test("shouldn't send verification email for verified user", async ({ expect }) => {
    await new SendEmailVerificationMail().dispatch({
      user: await User.factory().create(),
      version: 'v1',
      method: 'internal',
    })

    Mail.assertNothingSent()
  })

  test('should notify admins about new user', async ({ expect }) => {
    const admins = await User.factory().count(3).withRole('admin').create()
    const anotherUser = await User.factory().create()

    await new SendNewUserJoinedNotificationToAdmins().dispatch({
      user,
      version: 'v1',
      method: 'internal',
    })

    Notification.assertSentTo(admins)
    Notification.assertNotSentTo(anotherUser)
    Notification.assertNotSentTo(user)
  }).pin()
})
