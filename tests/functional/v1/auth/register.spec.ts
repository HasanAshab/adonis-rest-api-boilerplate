import { test } from '@japa/runner';
import Drive from '@ioc:Adonis/Core/Drive';
import Event from '@ioc:Adonis/Core/Event';
import User from 'App/Models/User';

//TODO
Event.assertEmitted = () => null;
Drive.assertStored = () => null;
Drive.assertStoredCount = () => null;

test.group('Auth/Register', (group) => {
	group.setup(async () => {
		Drive.fake();
		Event.fake();
	});

	group.each.setup(async () => {
		await resetDatabase();

		Drive.restore();
		Event.restore();
	});

	test('should register a user', async ({ expect, client }) => {
		const data = {
			username: 'foobar123',
			email: 'foo@gmail.com',
			password: 'Password@1234',
		};

		const response = await client.post('/api/v1/auth/register').json(data);
		const user = await User.findOne({ email: data.email });

		expect(response.status()).toBe(201);
		expect(response.body()).toHaveProperty('token');
		expect(user).not.toBeNull();
		expect(await user.settings).not.toBeNull();

		Event.assertEmitted('user:registered', {
			method: 'internal',
			version: 'v1',
			user,
		});
	});

	test('should register a user with profile', async ({ expect, client }) => {
		const data = {
			username: 'foobar123',
			email: 'foo@gmail.com',
		};

		const response = await client
			.post('/api/v1/auth/register')
			.fields(data)
			.field('password', 'Password@1234')
			.file('profile', filePath('image.png'));

		const user = await User.findOne(data);

		expect(response.status()).toBe(201);
		expect(response.body()).toHaveProperty('token');
		expect(user).not.toBeNull();
		expect(await user.settings).not.toBeNull();
		Event.assertEmitted('Registered', {
			user,
			version: 'v1',
			method: 'internal',
		});
		Drive.assertStoredCount(1);
		Drive.assertStored('image.png');
	});

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

	test("shouldn't register with existing username", async ({
		client,
		expect,
	}) => {
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
