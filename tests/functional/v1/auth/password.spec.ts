import { test } from '@japa/runner';
import Mail from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User';
import ResetPasswordMail from "App/Mails/ResetPasswordMail";
import { Settings } from "luxon";


test.group('Auth/Password', (group) => {
	const redirectUrl = "https://myapp.com/password/reset/{{id}}/{{token}}";
  let user;

	refreshDatabase(group);


	group.each.setup(async () => {
    user = await User.factory().hasSettings().create();
	});

	test('Should send reset email', async ({ client, expect }) => {
		const mailer = Mail.fake();

		const response = await client
		  .post('/api/v1/auth/password/forgot')
			.json({ 
        email: user.email,
			  redirectUrl
			})
		
		response.assertStatus(202);
		expect(
		  mailer.exists(mail => mail.to[0].address === user.email)
		).toBe(true);
	});

	test("Shouldn't send reset email if no user found", async ({ client, expect }) => {
		const mailer = Mail.fake();
    const email = "test@gmail.com";
    
		const response = await client
			.post('/api/v1/auth/password/forgot')
			.json({ email, redirectUrl });
		
		response.assertStatus(202);
    expect(
		  mailer.exists(mail => mail.to[0].address === email)
		).toBe(false);
	});
	
	test("Shouldn't send reset email of social account", async ({ client, expect }) => {
		const mailer = Mail.fake();
		const { email } = await User.factory().social().create();
		
		const response = await client
			.post('/api/v1/auth/password/forgot')
			.json({ email, redirectUrl });
		
		response.assertStatus(202);
    expect(
		  mailer.exists(mail => mail.to[0].address === email)
		).toBe(false);
	});

	test('should reset password', async ({ client, expect }) => {
		const mailer = Mail.fake();
		const token = await new ResetPasswordMail(user).resetToken();
		const password = 'Password@1234';
		
		const response = await client
		  .patch('/api/v1/auth/password/reset/' + user.id)
		  .json({ password, token });
		await user.refresh();
		
		response.assertStatus(200);
		expect(await user.comparePassword(password)).toBe(true);
	  expect(
		  mailer.exists(mail => mail.to[0].address === user.email)
		).toBe(true);
	});

	test("shouldn't reset password without token", async ({ client, expect }) => {
		const mailer = Mail.fake();
		const password = 'Password@1234';
		
    const response = await client
		  .patch('/api/v1/auth/password/reset/' + user.id)
		  .json({ password });
		await user.refresh();
		
		response.assertStatus(422);
		expect(await user.comparePassword(password)).toBe(false);
	  expect(
		  mailer.exists(mail => mail.to[0].address === user.email)
		).toBe(false);
	});
	
	test('shouldn"t reset password with expired token', async ({ client, expect }) => {
		const mailer = Mail.fake();
		const token = await new ResetPasswordMail(user).resetToken();
		const password = 'Password@1234';
		
		Settings.now = () => {
		  const currentDate = new Date();
      const afterThreeDays = new Date(currentDate);
      afterThreeDays.setDate(currentDate.getDate() + 4);
      return afterThreeDays.valueOf();
		}

		const response = await client
		  .patch('/api/v1/auth/password/reset/' + user.id)
		  .json({ password, token });
		await user.refresh();
		
		response.assertStatus(401);
		expect(await user.comparePassword(password)).toBe(false);
		expect(
		  mailer.exists(mail => mail.to[0].address === user.email)
		).toBe(false);
	});

	test("shouldn't reset password with invalid token", async ({ client, expect }) => {
		const mailer = Mail.fake();
		const password = 'Password@1234';
		
    const response = await client
		  .patch('/api/v1/auth/password/reset/' + user.id)
		  .json({
  			token: 'foo',
  			password
		  });
		await user.refresh();
		
		response.assertStatus(401);
		expect(await user.comparePassword(password)).toBe(false);
		expect(
		  mailer.exists(mail => mail.to[0].address === user.email)
		).toBe(false);
	});

	test("shouldn't reset password using same token multiple time", async ({ client, expect }) => {
	  const token = await new ResetPasswordMail(user).resetToken();
		const passwords = [
		  'Password@1234',
		  'Password@12345'
		];

		await client
		  .patch('/api/v1/auth/password/reset/' + user.id)
		  .json({ password: passwords[0], token });
		const mailer = Mail.fake();
		const response = await client
		  .patch('/api/v1/auth/password/reset/' + user.id)
		  .json({ password: passwords[1], token });
		await user.refresh();
		
		response.assertStatus(401);
		expect(await user.comparePassword(passwords[1])).toBe(false);
  	expect(
  		mailer.exists(mail => mail.to[0].address === user.email)
  	).toBe(false);

	});
});
