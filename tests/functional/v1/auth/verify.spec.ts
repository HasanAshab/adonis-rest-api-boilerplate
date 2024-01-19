import { test } from '@japa/runner';
import User from 'App/Models/User';
import EmailVerificationMail from "App/Mails/EmailVerificationMail";
import Client from '@ioc:Adonis/Addons/Client'
import Mail from '@ioc:Adonis/Addons/Mail';


test.group('Auth/Verify', group => {
  let user;
  
  refreshDatabase(group);

  group.each.setup(async () => {
		user = await User.factory().unverified().create();
	});


  test("should verify email", async ({ client, expect }) => {
    const url = await new EmailVerificationMail(user, 'v1').verificationUrl();
    const response = await client.get(url);
    await user.refresh();
    
    response.assertRedirectsTo(Client.makePath('verify.success'));
    expect(user.verified).toBe(true);
  });
  
  test("shouldn't verify email without signature", async ({ client, expect }) => {
    const response = await client.get(`api/v1/auth/verify/${user.id}`);
    await user.refresh();
    
    response.assertStatus(401);
    expect(user.verified).toBe(false);
  });
  
  test("should resend verification email", async ({ client, expect }) => {
    const mailer = Mail.fake();

    const response = await client.post("/api/v1/auth/verify/resend").json({
      email: user.email
    });
  
    response.assertStatus(200);
    expect(
		  mailer.exists(mail => mail.to[0].address === user.email)
		).toBe(true);
  });
  
  test("shouldn't resend verification email when no user found", async ({ client, expect }) => {
    const mailer = Mail.fake();
    const email = "test@gmail.com";
    
    const response = await client.post("/api/v1/auth/verify/resend").json({ email });
  
    response.assertStatus(200);
    expect(
		  mailer.exists(mail => mail.to[0].address === email)
		).toBe(false);
  });
});