import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import app from '@adonisjs/core/services/app'
import User from '#models/user'
import mail from '@adonisjs/mail/services/main'
import EmailVerificationMail from '#mails/email_verification_mail'
//import Notification from '#tests/assertors/notification_assertor'
import SendEmailVerificationMail from '#listeners/send_email_verification_mail'
//import SendNewUserJoinedNotificationToAdmins from '#listeners/send_new_user_joined_notification_to_admins'
import Registered from '#events/registered'

/*
Run this suits:
node ace test unit --files="events/registered.spec.ts"
*/
test.group('Events / Registered', (group) => {
  refreshDatabase(group)

  group.each.setup(async () => {
    //Notification.fake()
  })

  test('should send verification email on internal method', async () => {
    const { mails } = mail.fake()
    const user = await User.factory().unverified().create()
    const event = new Registered(user, 'internal', 'v1')
    const listener = await app.container.make(SendEmailVerificationMail)

    await app.container.call(listener, 'handle', [event])

    mails.assertQueued(EmailVerificationMail, ({ message }) => {
      return message.hasTo(user.email)
    })
  })

  test("shouldn't send verification email for verified user", async () => {
    const { mails } = mail.fake()
    const user = await User.factory().create()
    const event = new Registered(user, 'internal', 'v1')
    const listener = await app.container.make(SendEmailVerificationMail)

    await app.container.call(listener, 'handle', [event])

    mails.assertNoneQueued()
  })

  test('should notify admins about new user', async () => {
    const user = await User.factory().unverified().create()
    const anotherUser = await User.factory().create()
    const admins = await User.factory().count(3).withRole('admin').create()
    const event = new Registered(user, 'internal', 'v1')

    await new SendNewUserJoinedNotificationToAdmins().handle(event)

    Notification.assertSentTo(admins)
    Notification.assertNotSentTo(anotherUser)
  })
})
