import { test } from '@japa/runner';
import User from 'App/Models/User';
import Settings from 'App/Models/Settings';
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService';


test.group('Auth/TwoFactor', (group) => {
  const twoFactorAuthService = new TwoFactorAuthService();
	let user;

	refreshDatabase(group);
	

	group.each.setup(async () => {
		user = await User.factory().hasSettings().create();
	});
  

  test("Should enable Two Factor Authorization", async ({ client, expect }) => {
    const user = await User.factory().hasSettings().withPhoneNumber().create();

    const response = await client.post("/api/v1/auth/two-factor/setup").loginAs(user).json({ enable: true });

    await user.load('settings');
    expect(response.status()).toBe(200);
    expect(response.body().data.recoveryCodes).toHaveLength(10);

    expect(user.settings.twoFactorAuth).toEqual({
      enabled: true,
      method: 'sms',
      secret: null
    });
  }).pin();
  
  test("Should disable Two Factor Authorization", async ({ client, expect }) => {
    const user = await User.factory().hasSettings(true).withPhoneNumber().create();
    const response = await client.post("/api/v1/auth/two-factor/setup").actingAs(token).send({ enable: false });
    await user.load('settings');
    
    expect(response.status()).toBe(200);
    expect(user.settings.twoFactorAuth.enabled).toBe(false);
  });
  
  test("Two Factor Authorization should flag for phone number if not setted", async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/two-factor/setup").actingAs(token).send({ enable: true });
    const settings = await user.settings;
    expect(response.status()).toBe(400);
    expect(response.body().data.phoneNumberRequired).toBe(true);
    expect(settings.twoFactorAuth.enabled).toBe(false);
  });
  
  test("Two Factor Authorization app method sends OTP Auth URL", async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/two-factor/setup").actingAs(token).send({ enable: true, method: "app" });
    const settings = await user.settings;
    expect(response.status()).toBe(200);
    expect(response.body().data).toHaveProperty("otpauthURL");
    expect(response.body().data.recoveryCodes).toHaveLength(10);
    expect(settings.twoFactorAuth.enabled).toBe(true);
  });

  test("Should change Two Factor Authorization method", { mfa: true, phone: true }, async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/two-factor/setup").actingAs(token).send({ method: "call" });
    const settings = await user.settings;
    expect(response.status()).toBe(200);
    expect(response.body().data.recoveryCodes).toHaveLength(10);
    expect(settings.twoFactorAuth.method).toBe("call");
  });


  test("Should send otp", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await client.post("/api/v1/auth/send-otp/" + user._id);
    await sleep(2000)
    const token = await Token.findOne({ key: user._id, type: "2fa" });
    
    expect(response.status()).toBe(200);
    expect(otp).not.toBeNull();
  });

  test("should recover a user with valid recovery code", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const [ code ] = await user.generateRecoveryCodes(1);
    const response = await client.post("/api/v1/auth/login/recovery-code").json({
      email: user.email,
      code
    });
    expect(response.status()).toBe(200);
    expect(response.body().data).toHaveProperty("token");
  });
  
  test("shouldn't login a user with same recovery code multiple times", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const [ code ] = await user.generateRecoveryCodes(1);
    const response1 = await client.post("/api/v1/auth/login/recovery-code").json({ email: user.email, code });
    const response2 = await client.post("/api/v1/auth/login/recovery-code").json({ email: user.email, code });
    expect(response1.statusCode).toBe(200);
    expect(response2.statusCode).toBe(401);
    expect(response1.body.data).toHaveProperty("token");
    expect(response2.body).not.toHaveProperty("data");
  });
  
  test("shouldn't login a user with invalid recovery code", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    await user.generateRecoveryCodes(1);
    const response = await client.post("/api/v1/auth/login/recovery-code").json({
      email: user.email,
      code: "foo-bar"
    });
    expect(response.status()).toBe(401);
    expect(response.body()).not.toHaveProperty("data");
  });
  
  test("should generate new recovery codes", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const oldCodes = await user.generateRecoveryCodes();
    const response = await client.post("/api/v1/auth/generate-recovery-codes").actingAs(user.createToken());
    expect(response.status()).toBe(200);
    expect(response.body().data).toHaveLength(10);
    expect(response.body().data).not.toEqual(oldCodes);
  });
});