import { test } from '@japa/runner';
import User from 'App/Models/User';
import EmailVerificationMail from "App/Mails/EmailVerificationMail";

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
    
    response.assertStatus(200);
    response.assertRedirectsTo('/email/verify/success');
    
    expect(user.verified).toBe(true);
  }).pin();
  
  test("shouldn't verify email without signature", async ({ client, expect }) => {
    const response = await client.get(`api/v1/auth/verify/${user.id}`);
    await user.refresh();
    
    response.assertStatus(401);
    expect(user.verified).toBe(false);
  });
  
  test("should resend verification email", async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/verify/resend").json({
      email: user.email
    });
  
    response.assertStatus(200);
    Notification.assertSentTo(user, EmailVerificationNotification);
  });
});