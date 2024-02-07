import { test } from '@japa/runner'
import User from 'App/Models/User'
import Mail from 'Tests/Assertors/MailAssertor'
import SendEmailVerificationMail from 'App/Listeners/SendEmailVerificationMail'
import SendNewUserJoinedNotificationToAdmins from 'App/Listeners/SendNewUserJoinedNotificationToAdmins'
import Notification from '@ioc:Verful/Notification'


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
    const admins = await User.factory().count(2).hasSettings().withRole('admin').create()
    const anotherUser = await User.factory().create()
    

    Notification.trap((data, to) => {
      
    })

    await new SendNewUserJoinedNotificationToAdmins().dispatch({
      user,
      version: 'v1',
      method: 'internal',
    })
    
    admins.forEach((admin) => {
      Mail.assertSentTo(admin.email)
    })

  }).pin()
})
