import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import mail from '@adonisjs/mail/services/main'
import Notification from '#tests/assertors/notification_assertor'
import SendEmailVerificationMail from '#listeners/send_email_verification_mail'
import SendNewUserJoinedNotificationToAdmins from '#listeners/send_new_user_joined_notification_to_admins'
import Registered from '#events/registered'

/*
Run this suits:
node ace test unit --files="events/registered.spec.ts"
*/
test.group('Events / Registered', (group) => {
  let user

  refreshDatabase(group)
  
  group.each.setup(() => {
    Notification.fake()
    user = await User.factory().unverified().create()
  })

  test('should send verification email on internal method', async () => {
    const { mails } = mail.fake()
    const event = new Registered(user, 'internal', 'v1')
    
    await new SendEmailVerificationMail().handle(event)
    
    mails.assertQueued(Registered, ({ message }) => {
      return message.hasTo(user.email)
    })
  })

  test("shouldn't send verification email for verified user", async () => {
    const { mails } = mail.fake()
    const user = await User.factory().create()
    const event = new Registered(user, 'internal', 'v1')
    
    await new SendEmailVerificationMail().handle(event)
    
    mails.assertNoneQueued()
  })

  test('should notify admins about new user', async ({ expect }) => {
    const admins = await User.factory().count(3).withRole('admin').create()
    const anotherUser = await User.factory().create()
    const event = new Registered(user, 'internal', 'v1')

    await new SendNewUserJoinedNotificationToAdmins().dispatch(event)

    Notification.assertSentTo(admins)
    Notification.assertNotSentTo(anotherUser)
    Notification.assertNotSentTo(user)
  })
})
