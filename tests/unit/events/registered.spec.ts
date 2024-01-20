import { test } from '@japa/runner';
import User from "App/Models/User";
//import Mail from '@ioc:Adonis/Addons/Mail';
import Mail from 'Tests/Assertors/MailAssertor';
import SendEmailVerificationMail from "App/Listeners/SendEmailVerificationMail";
import SendNewUserJoinedNotificationToAdmins from "App/Listeners/SendNewUserJoinedNotificationToAdmins";

test.group("Events/Registered", group => {
  let user;
  
  group.setup(async () => {
    user = await User.factory().unverified().create();
  });
  
  group.each.setup(() => {
    Mail.fake();
  });

  test("should send verification email on internal method", async ({ expect }) => {
    await new SendEmailVerificationMail().dispatch({
      user,
      version: "v1",
      method: "internal"
    });
    
    Mail.assertSentTo(user.email)
  });
  
  test("shouldn't send verification email on social method", async ({ expect }) => {
    await new SendEmailVerificationMail().dispatch({
      user,
      version: "v1",
      method: "social"
    });
    
    Mail.assertNothingSent()
  });

  
  test("should notify admins about new user", async ({ expect }) => {
    const admins = await User.factory().count(3).hasSettings().withRole("admin").create();

    await new SendNewUserJoinedNotificationToAdmins().dispatch({ 
      user,
      version: "v1",
      method: "internal"
    });
    
    admins.forEach(admin => {
      Mail.assertSentTo(admin.email)
    });
    
    //TODO db notif assertions
  });
});
