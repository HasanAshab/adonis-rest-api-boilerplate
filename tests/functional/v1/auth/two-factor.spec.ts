import { test } from '@japa/runner';
import User from 'App/Models/User';
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService';


test.group('Auth/TwoFactor', (group) => {
  const twoFactorAuthService = new TwoFactorAuthService();
	let user;

	refreshDatabase(group);
	

	group.each.setup(async () => {
		user = await User.factory().hasSettings().create();
	});
  
  
  it("Should enable Two Factor Authorization", { phone: true }, async () => {
    const response = await request.post("/api/v1/settings/setup-2fa").actingAs(token).send({ enable: true });
    const settings = await user.settings;
    expect(response.statusCode).toBe(200);
    expect(response.body.data.recoveryCodes).toHaveLength(10);
    expect(settings.twoFactorAuth.enabled).toBe(true);
    expect(settings.twoFactorAuth.method).toBe("sms");
  });
  
  it("Should disable Two Factor Authorization", { mfa: true, phone: true }, async () => {
    const response = await request.post("/api/v1/settings/setup-2fa").actingAs(token).send({ enable: false });
    const settings = await user.settings;
    expect(response.statusCode).toBe(200);
    expect(settings.twoFactorAuth.enabled).toBe(false);
  });
  
  it("Two Factor Authorization should flag for phone number if not setted", async () => {
    const response = await request.post("/api/v1/settings/setup-2fa").actingAs(token).send({ enable: true });
    const settings = await user.settings;
    expect(response.statusCode).toBe(400);
    expect(response.body.data.phoneNumberRequired).toBe(true);
    expect(settings.twoFactorAuth.enabled).toBe(false);
  });
  
  it("Two Factor Authorization app method sends OTP Auth URL", async () => {
    const response = await request.post("/api/v1/settings/setup-2fa").actingAs(token).send({ enable: true, method: "app" });
    const settings = await user.settings;
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty("otpauthURL");
    expect(response.body.data.recoveryCodes).toHaveLength(10);
    expect(settings.twoFactorAuth.enabled).toBe(true);
  });

  it("Should change Two Factor Authorization method", { mfa: true, phone: true }, async () => {
    const response = await request.post("/api/v1/settings/setup-2fa").actingAs(token).send({ method: "call" });
    const settings = await user.settings;
    expect(response.statusCode).toBe(200);
    expect(response.body.data.recoveryCodes).toHaveLength(10);
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
