import { test } from '@japa/runner';
import { omit, pick } from 'lodash';
import Drive from '@ioc:Adonis/Core/Drive';
import User from 'App/Models/User';
import Event from 'Tests/Assertors/EventAssertor';


test.group('Auth/Register', (group) => {
	refreshDatabase(group);
	
	group.setup(async () => {
		Event.fake();
	});
  
  
	group.each.setup(async () => {
		Drive.restore();
	});

	test('should register a user', async ({ expect, client }) => {
		const data = {
			username: 'foobar123',
			email: 'foo@gmail.com',
			password: 'Password@1234'
		};

		const response = await client.post('/api/v1/auth/register').json(data);
		
		const user = await User.query().whereEqual(omit(data, 'password')).preload('settings').first();
		expect(response.status()).toBe(201);
		expect(response.body()).toHaveProperty('data.token');
		expect(user).not.toBeNull();
		expect(user.settings).not.toBeNull();

		Event.assertDispatchedContain('registered', {
			version: 'v1',
			method: 'internal',
			user: pick(user, 'id')
		});
	});

	test('should register a user with avatar', async ({ expect, client }) => {
		const drive = Drive.fake();

		const data = {
			username: 'foobar123',
			email: 'foo@gmail.com',
			password: 'Password@1234'
		};

		const response = await client
			.post('/api/v1/auth/register')
			.file('avatar', fakeFilePathPath('image.png'))
			.fields(data);

		const user = await User.query().whereEqual(omit(data, 'password')).preload('settings').first();

		expect(response.status()).toBe(201);
		expect(response.body()).toHaveProperty('data.token');
		expect(user).not.toBeNull();
		expect(user.settings).not.toBeNull();

		Event.assertDispatchedContain('registered', {
			version: 'v1',
			method: 'internal',
			user: pick(user, 'id')
		});
		
		expect(await drive.exists('image.png')).toBe(true);
	}).pin();

	test("shouldn't register with existing email", async ({ client, expect }) => {
		const user = await User.factory().create();

		const response = await client.post('/api/v1/auth/register').json({
			username: 'foo',
			email: user.email,
			password: 'Password@1234',
		});

		expect(response.status()).toBe(422);
		expect(response.body()).not.toHaveProperty('token');
	});

	test("shouldn't register with existing username", async ({ client, expect }) => {
		const user = await User.factory().create();

		const response = await client.post('/api/v1/auth/register').json({
			username: user.username,
			email: 'foo@test.com',
			password: 'Password@1234',
		});

		expect(response.status()).toBe(422);
		expect(response.body()).not.toHaveProperty('data');
	});
});
