import { test } from '@japa/runner';
import Mail from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User';
import ResetPasswordMail from "App/Mails/ResetPasswordMail";

import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'

test.group('Auth/Password', (group) => {
	const redirectUrl = "https://myapp.com/password/reset/{{id}}/{{token}}";
	let mailer;
  let user;

	refreshDatabase(group);


	group.setup(() => {
	  mailer = Mail.fake();
	})
	
	group.each.setup(async () => {
    Mail.restore();
    user = await User.factory().hasSettings().create();
	});

	test('Should send reset email', async ({ client, expect }) => {
		const response = await client
		  .post('/api/v1/auth/password/forgot')
			.json({ 
        email: user.email,
			  redirectUrl
			});
		
		expect(response.status()).toBe(202);
		
		mailer.exists(trace)
		//Notification.assertSentTo(user, ForgotPasswordNotification);
	}).pin();

	test("Shouldn't send reset email if no user found", async ({ client, expect }) => {
		const response = await client
			.post('/api/v1/auth/password/forgot')
			.json({ email: "test@gmail.com" });
		
		Notification.assertNothingSent();
	});
	
	test("Shouldn't send reset email of social account", async ({ client, expect }) => {
		const user = await User.factory().social().create();
		
		const response = await client
			.post('/api/v1/auth/password/forgot')
			.json({ email: user.email });
		
		Notification.assertNothingSent();
	});

	test('should reset password', async ({ client, expect }) => {
		const token = await new ResetPasswordMail(user).resetToken();
		const password = 'Password@1234';
		const response = await client
		  .patch('/api/v1/auth/password/reset/' + user.id).
		  json({ password, token });
		
		await user.refresh();
		expect(response.status()).toBe(200);
		expect(await user.comparePassword(password)).toBe(true);
	});

	test("shouldn't reset password with invalid token", async ({ client, expect }) => {
		const password = 'Password@1234';
		
    const response = await client
		  .patch('/api/v1/auth/password/reset' + user.id)
		  .json({
  			token: 'foo',
  			password
		  });
		
		await user.refresh();
		expect(response.status()).toBe(401);
		expect(await user.comparePassword(password)).toBe(false);
	});
});
