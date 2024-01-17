import { test } from '@japa/runner';
import User from "App/Models/User";
import Mail from '@ioc:Adonis/Addons/Mail';
import SendEmailVerificationMail from "App/Listeners/SendEmailVerificationMail";
import SendNewUserJoinedNotificationToAdmins from "App/Listeners/SendNewUserJoinedNotificationToAdmins";

test.group("Events/Registered", group => {
  let user;
  
  group.setup(async () => {
    user = await User.factory().unverified().create();
  });

  test("should send verification email on internal method", async ({ expect }) => {
    const mailer = Mail.fake();
    
    await new SendEmailVerificationMail().dispatch({
      user,
      version: "v1",
      method: "internal"
    });

    expect(
		  mailer.exists(mail => mail.to[0].address === user.email)
		).toBe(true);
  });
  
  test("shouldn't send verification email on social method", async ({ expect }) => {
    const mailer = Mail.fake();
    
    await new SendEmailVerificationMail().dispatch({
      user,
      version: "v1",
      method: "social"
    });
    
    expect(
		  mailer.exists(mail => mail.to[0].address === user.email)
		).toBe(false);
  });

  
  test("should notify admins about new user", async ({ expect }) => {
    const mailer = Mail.fake();
    const admins = await User.factory().count(3).hasSettings().withRole("admin").create();

    await new SendNewUserJoinedNotificationToAdmins().dispatch({ 
      user,
      version: "v1",
      method: "internal"
    });
    
    admins.forEach(admin => {
      expect(
  		  mailer.exists(mail => mail.to[0].address === admin.email)
  		).toBe(true);
    });
    
    //TODO db notif
  }).pin();
});
