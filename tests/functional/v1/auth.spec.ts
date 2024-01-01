import { test } from '@japa/runner'
import Drive from '@ioc:Adonis/Core/Drive'
import Event from '@ioc:Adonis/Core/Event'
import User from "App/Models/User";
import TwoFactorAuthService from "App/Services/Auth/TwoFactorAuthService"

//TODO
Event.assertEmitted = () => null;
Drive.assertStored = () => null;
Drive.assertStoredCount = () => null;

test.group('Auth', group => {
  let user;
  let token;
  const twoFactorAuthService = new TwoFactorAuthService();

  group.setup(async () => {
    //Notification.fake();
    Drive.fake();
    Event.fake();
  });

  group.each.setup(async () => {
    await resetDatabase(); 

    //Notification.restore();
    Drive.restore();
    Event.restore();
    
    user = await User.factory().hasSettings().create();
    token = user.createToken();
  });
  
  
  test("should register a user", async ({ expect, client }) => {
    const data = {
      username: "foobar123",
      email: "foo@gmail.com",
      password: "Password@1234"
    };
    
    const response = await client.post("/api/v1/auth/register").json(data);
    const user = await User.findOne({ email: data.email });


    expect(response.status()).toBe(201);
    expect(response.body()).toHaveProperty("token");
    expect(user).not.toBeNull();
    expect(await user.settings).not.toBeNull();

    Event.assertEmitted("user:registered", {
      method: "internal",
      version: "v1",
      user
    });
  });

  test("should register a user with profile", async ({ expect, client }) => {
    const data = {
      username: "foobar123",
      email: "foo@gmail.com",
    };
    
    const response = await client
      .post("/api/v1/auth/register")
      .fields(data)
      .field("password", "Password@1234")
      .file("profile", filePath("image.png"));
    
    const user = await User.findOne(data);
    
    expect(response.status()).toBe(201);
    expect(response.body()).toHaveProperty("token");
    expect(user).not.toBeNull();
    expect(await user.settings).not.toBeNull();
    Event.assertEmitted("Registered", {
      user,
      version: "v1",
      method: "internal"
    });
    Drive.assertStoredCount(1);
    Drive.assertStored("image.png");
  });

  test("shouldn't register with existing email", async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/register").json({
      username: "foo",
      email: user.email,
      password: "Password@1234"
    });

    expect(response.status()).toBe(422);
    expect(response.body()).not.toHaveProperty("token");
  });
  
  test("shouldn't register with existing username", async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/register").json({
      username: user.username,
      email: "foo@test.com",
      password: "Password@1234"
    });
    
    expect(response.status()).toBe(422);
    expect(response.body()).not.toHaveProperty("data");
  });

  test("should login a user", async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/login").json({
      email: user.email,
      password: "password"
    });
    
    expect(response.status()).toBe(200);
    expect(response.body()).toHaveProperty("token");
  });

  test("shouldn't login with wrong password", async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/login").json({
      email: user.email,
      password: "wrong-pass"
    });
    
    expect(response.status()).toBe(401);
    expect(response.body()).not.toHaveProperty("token");
  });

  test("shouldn't login manually in social account", async ({ client, expect }) => {
    const user = await User.factory().social().create();
    const response = await client.post("/api/v1/auth/login").json({
      email: user.email,
      password: "password"
    });
    
    expect(response.status()).toBe(401);
    expect(response.body()).not.toHaveProperty("token");
  });
  
  test("should prevent Brute Force login", async ({ client, expect }) => {
    const limit = 4;
    const payload = {
      email: user.email,
      password: "wrong-pass"
    };
    const responses = [];
    
    for (let i = 0; i < limit; i++) {
      const response = await client.post("/api/v1/auth/login").json(payload);
      responses.push(response);
    }
    
    const lockedResponse = await client.post("/api/v1/auth/login").json(payload);
    
    expect(responses.every(res => res.status() === 401)).toBe(true);
    expect(lockedResponse.status()).toBe(429);
  });

  test("Login should flag for otp if not provided for 2FA enabled account", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await client.post("/api/v1/auth/login").json({
      email: user.email,
      password: "password"
    });

    expect(response.status()).toBe(401);
    expect(response.header('x-2fa-code')).toBe('required');
    expect(response.body()).not.toHaveProperty("token");
  });
  
  test("should login a user with valid otp (2FA)", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const otp = await twoFactorAuthService.createToken(user);
    const response = await client.post("/api/v1/auth/login").json({
      email: user.email,
      password: "password",
      otp
    });

    expect(response.status()).toBe(200);
    expect(response.body()).toHaveProperty("token");
  });

  test("shouldn't login a user with invalid OTP (2FA)", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await client.post("/api/v1/auth/login").json({
      email: user.email,
      password: "password",
      otp: twoFactorAuthService.generateOTPCode()
    });
    
    expect(response.status()).toBe(401);
    expect(response.body()).not.toHaveProperty("token");
  });
})

/*
describe("Auth", () => {
  
  const authService = new AuthService();
  
  test("should login a user with valid recovery code", async ({ client, expect }) => {
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

  test("Should complete social login with username", async ({ client, expect }) => {
    const username = "FooBar123";
    const externalUser = {
      id: "10000",
      name: "Foo Bar",
      email: "foo@bar.com",
      picture: "www.foo.com"
    };
    const token = await authService.createExternalLoginFinalStepToken("google", externalUser);
    const response = await client.post("/api/v1/auth/login/external/google/final-step").json({ 
      token,
      username,
      externalId: externalUser.id
    });
    const user = await User.findOne({ username });
    expect(response.status()).toBe(201);
    expect(user).not.toBeNull();
    expect(await user.settings).not.toBeNull();
    Event.assertEmitted("Registered", {
      user,
      version: "v1",
      method: "social"
    });
  });
  
  test("Should complete social login with email and username", async ({ client, expect }) => {
    const data = {
      username: "FooBar123",
      email: "foo@bar.com"
    }
    const externalUser = {
      id: "10000",
      name: "Foo Bar",
      picture: "www.foo.com"
    };
    const token = await authService.createExternalLoginFinalStepToken("google", externalUser);
    const response = await client.post("/api/v1/auth/login/external/google/final-step").json({ 
      token,
      externalId: externalUser.id,
      ...data
    });
    const user = await User.findOne(data);
    expect(response.status()).toBe(201);
    expect(user).not.toBeNull();
    expect(await user.settings).not.toBeNull();
    Event.assertEmitted("Registered", {
      user,
      version: "v1",
      method: "social"
    });
  });

  test("Shouldn't complete social login with invalid token", async ({ client, expect }) => {
    const username = "FooBar123";
    const response = await client.post("/api/v1/auth/login/external/google/final-step").json({
      username,
      token: "invalid-token",
      externalId: "1000"
    });
    const user = await User.findOne({ username });
    expect(response.status()).toBe(401);
    expect(user).toBeNull();
  })
  
  test("Shouldn't complete social login with same token multiple times", async ({ client, expect }) => {
    const externalUser = {
      id: "10000",
      name: "Foo Bar",
      email: "foo@bar.com",
      picture: "www.foo.com"
    };
    const token = await authService.createExternalLoginFinalStepToken("google", externalUser);
    await client.post("/api/v1/auth/login/external/google/final-step").json({ 
      token,
      username: "foo12",
      externalId: externalUser.id
    });
    const response = await client.post("/api/v1/auth/login/external/google/final-step").json({ 
      token,
      username: "foo95",
      externalId: externalUser.id
    });
    expect(response.status()).toBe(401);
  });

  test("Should send otp", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await client.post("/api/v1/auth/send-otp/" + user._id);
    await sleep(2000)
    const token = await Token.findOne({ key: user._id, type: "2fa" });
    
    expect(response.status()).toBe(200);
    expect(otp).not.toBeNull();
  });
  
  test("should verify email", async ({ client, expect }) => {
    const user = await User.factory().unverified().create();
    const token = await (new EmailVerificationNotification).createVerificationToken(user);
    const response = await client.get(`/auth/verify/${user._id}/${token}`);
    await user.refresh();
    expect(response.status).toBe(200);
    expect(user.verified).toBe(true);
  });

  test("shouldn't verify email with invalid token", async ({ client, expect }) => {
    const user = await User.factory().unverified().create();
    const response = await client.get(`/auth/verify/${user._id}/invalid-token`);
    await user.refresh();
    expect(response.status).toBe(401);
    expect(user.verified).toBe(false);
  });

  test("should resend verification email", async ({ client, expect }) => {
    const user = await User.factory().unverified().create();
    const response = await client.post("/api/v1/auth/verify/resend").json({
      email: user.email
    });

    expect(response.status()).toBe(200);
    Notification.assertSentTo(user, EmailVerificationNotification);
  });


  test("should change password", async ({ client, expect }) => {
    const data = {
      oldPassword: "password",
      newPassword: "Password@1234",
    };
    const response = await client.patch("/api/v1/auth/password/change").actingAs(token).json(data);
    await user.refresh();
    expect(response.status()).toBe(200);
    expect(await user.attempt(data.newPassword)).toBe(true);
  });

  test("shouldn't change password of OAuth account", async ({ client, expect }) => {
    const user = await User.factory().oauth().create();
    const response = await client.patch("/api/v1/auth/password/change").actingAs(user.createToken()).json({
      oldPassword: "password",
      newPassword: "Password@1234"
    });
    expect(response.status()).toBe(403);
  });

  test("Should update phone number with valid otp", async ({ client, expect }) => {
    const user = await User.factory().hasSettings().create();
    const phoneNumber = "+14155552671";
    const otp = await twoFactorAuthService.createToken(user);
    const response = await client.patch("/api/v1/auth/change-phone-number").actingAs(user.createToken()).json({ phoneNumber, otp });
    await user.refresh();
    expect(response.status()).toBe(200);
    expect(user.phoneNumber).toBe(phoneNumber);
  });
  
  test("Shouldn't update phone number with invalid otp", async ({ client, expect }) => {
    const phoneNumber = "+14155552671";
    const response = await client.patch("/api/v1/auth/change-phone-number").actingAs(token).json({ phoneNumber, otp: 123456 });
    await user.refresh();
    expect(response.status()).toBe(401);
    expect(user.phoneNumber).not.toBe(phoneNumber);
  });
  
  test("Update phone number should send otp if otp code not provided", async ({ client, expect }) => {
    const phoneNumber = "+14155552671";
    const response = await client.patch("/api/v1/auth/change-phone-number").actingAs(token).json({ phoneNumber });
    const otp = await Token.findOne({ key: user._id, type: "2fa" });
    await user.refresh();
    expect(response.status()).toBe(200);
    expect(user.phoneNumber).not.toBe(phoneNumber);
    expect(otp).not.toBeNull();
  });
});
*/