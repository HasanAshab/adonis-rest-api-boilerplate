import DB from "DB";
import Cache from "Cache";
import Storage from "Storage";
import Notification from "Notification";
import User from "~/app/models/User";
import Token from "~/app/models/Token";
import EmailVerificationNotification from "~/app/notifications/EmailVerificationNotification";
import ForgotPasswordNotification from "~/app/notifications/ForgotPasswordNotification";
import AuthService from "~/app/services/auth/AuthService";
import twoFactorAuthService from "~/app/services/auth/TwoFactorAuthService";
import Event from "~/core/events/Event";

describe("Auth", () => {
  let user;
  let token;
  const authService = new AuthService();
  const twoFactorAuthService = new TwoFactorAuthService();
  
  beforeAll(async () => {
    await DB.connect();
  });
    

  beforeEach(async config => {
    await DB.reset(["User", "Token"]);
    Storage.mockClear();
    Notification.mockClear();
    Event.mockClear();
    if(config.user) {
      user = await User.factory().create();
      token = user.createToken();
    }
  });

  it.only("should register a user", async ({ client, expect }) => {
    const data = {
      username: "foobar123",
      email: "foo@gmail.com",
      password: "Password@1234",
      profile: fakeFilePath("image.png")
    };
    const response = await client.post("/api/v1/auth/register").multipart(data);
    const user = await User.findOne({ email: data.email });
    response.assertStatus(201);
    expect(response.body.data).toHaveProperty("token");
    expect(user).not.toBeNull();
    expect(await user.settings).not.toBeNull();
    Event.assertEmitted("Registered", {
      user,
      version: "v1",
      method: "internal"
    });
    Storage.assertStoredCount(1);
    Storage.assertStored("image.png");
  });

  test("should register a user without profile", async ({ client, expect }) => {
    const data = {
      username: "foobar123",
      email: "foo@gmail.com",
      password: "Password@1234"
    };
    const response = await client.post("/api/v1/auth/register").multipart(data);
    const user = await User.findOne({ email: data.email });
    response.assertStatus(201);
    expect(response.body.data).toHaveProperty("token");
    expect(user).not.toBeNull();
    expect(await user.settings).not.toBeNull();
    Event.assertEmitted("Registered", {
      user,
      version: "v1",
      method: "internal"
    });
    Storage.assertNothingStored();
  });

  test("shouldn't register with existing email", { user: true }, async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/register").multipart({
      username: "foo",
      email: user.email,
      password: "Password@1234"
    });

    response.assertStatus(400);
    expect(response.body).not.toHaveProperty("data");
  });

  test("shouldn't register with existing username", { user: true }, async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/register").multipart({
      username: user.username,
      email: "foo@test.com",
      password: "Password@1234"
    });
    response.assertStatus(400);
    expect(response.body).not.toHaveProperty("data");
  });

  test("should login a user", async ({ client, expect }) => {
    const user = await User.factory().hasSettings().create();
    const response = await client.post("/api/v1/auth/login").json({
      email: user.email,
      password: "password"
    });
    response.assertStatus(200);
    expect(response.body.data).toHaveProperty("token");
  });

  test("shouldn't login with wrong password", { user: true }, async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/login").json({
      email: user.email,
      password: "wrong-pass"
    });
    response.assertStatus(401);
    expect(response.body.data?.token).toBe(undefined);
  });
    
  test("shouldn't login manually in OAuth account", async ({ client, expect }) => {
    const user = await User.factory().oauth().create();
    const response = await client.post("/api/v1/auth/login").json({
      email: user.email,
      password: "password"
    });
    response.assertStatus(401);
    expect(response.body.data?.token).toBe(undefined);
  });

  test("Login should flag for otp if not provided in (2FA)", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await client.post("/api/v1/auth/login").json({
      email: user.email,
      password: "password"
    });
    response.assertStatus(200);
    expect(response.body.data.twoFactorAuthRequired).toBe(true);
    expect(response.body.data).not.toHaveProperty("token");
  });

  test("should login a user with valid otp (2FA)", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const otp = await twoFactorAuthService.createToken(user);
    const response = await client.post("/api/v1/auth/login").json({
      otp,
      email: user.email,
      password: "password"
    });
    response.assertStatus(200);
    expect(response.body.data).toHaveProperty("token");
  });

  test("shouldn't login a user with invalid OTP (2FA)", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await client.post("/api/v1/auth/login").json({
      email: user.email,
      password: "password",
      otp: 999999
    });
    response.assertStatus(401);
    expect(response.body).not.toHaveProperty("body");
  });
  
  test("should prevent Brute Force login", { user: true }, async ({ client, expect }) => {
    const payload = {
      email: user.email,
      password: "wrong-pass"
    };
    const responses = [];
    for (let i = 0; i < 5; i++) {
      const response = await client.post("/api/v1/auth/login").send(payload);
      responses.push(response);
    }
    expect(responses[0].statusCode).toBe(401);
    expect(responses[1].statusCode).toBe(401);
    expect(responses[2].statusCode).toBe(401);
    expect(responses[3].statusCode).toBe(401);
    expect(responses[4].statusCode).toBe(429);
  });
  
  test("should login a user with valid recovery code", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const [ code ] = await user.generateRecoveryCodes(1);
    const response = await client.post("/api/v1/auth/login/recovery-code").json({
      email: user.email,
      code
    });
    response.assertStatus(200);
    expect(response.body.data).toHaveProperty("token");
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
    response.assertStatus(401);
    expect(response.body).not.toHaveProperty("data");
  });
  
  test("should generate new recovery codes", { user: true }, async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const oldCodes = await user.generateRecoveryCodes();
    const response = await client.post("/api/v1/auth/generate-recovery-codes").actingAs(user.createToken());
    response.assertStatus(200);
    expect(response.body.data).toHaveLength(10);
    expect(response.body.data).not.toEqual(oldCodes);
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
    response.assertStatus(201);
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
    response.assertStatus(201);
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
    response.assertStatus(401);
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
    response.assertStatus(401);
  });

  test("Should send otp", async ({ client, expect }) => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await client.post("/api/v1/auth/send-otp/" + user._id);
    await sleep(2000)
    const token = await Token.findOne({ key: user._id, type: "2fa" });
    
    response.assertStatus(200);
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

    response.assertStatus(200);
    Notification.assertSentTo(user, EmailVerificationNotification);
  });

  test("should change password", { user: true }, async ({ client, expect }) => {
    const data = {
      oldPassword: "password",
      newPassword: "Password@1234",
    };
    const response = await client.patch("/api/v1/auth/password/change").loginAs(user).send(data);
    await user.refresh();
    response.assertStatus(200);
    expect(await user.attempt(data.newPassword)).toBe(true);
  });

  test("shouldn't change password of OAuth account", async ({ client, expect }) => {
    const user = await User.factory().oauth().create();
    const response = await client.patch("/api/v1/auth/password/change").actingAs(user.createToken()).json({
      oldPassword: "password",
      newPassword: "Password@1234"
    });
    response.assertStatus(403);
  });

  test("Should send reset email", { user: true }, async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/password/forgot").json({ email: user.email });
    response.assertStatus(202);
    Notification.assertSentTo(user, ForgotPasswordNotification);
  });

  test("Shouldn't send reset email of OAuth account", async ({ client, expect }) => {
    const user = await User.factory().oauth().create();
    const response = await client.post("/api/v1/auth/password/forgot").json({
      email: user.email
    });
    Notification.assertNothingSent();
  });

  test("should reset password", { user: true }, async ({ client, expect }) => {
    const token = await (new ForgotPasswordNotification).createForgotPasswordToken(user);
    const password = "Password@1234";
    const response = await client.patch("/api/v1/auth/password/reset").json({
      id: user._id.toString(),
      password,
      token
    });
    await user.refresh();
    response.assertStatus(200);
    expect(await user.attempt(password)).toBe(true);
  });

  test("shouldn't reset password with invalid token", { user: true }, async ({ client, expect }) => {
    const password = "Password@1234";
    const response = await client.patch("/api/v1/auth/password/reset").json({
      id: user._id.toString(),
      token: "foo",
      password
    });
    await user.refresh();
    response.assertStatus(401);
    expect(await user.attempt(password)).toBe(false);
  });

  test("Should update phone number with valid otp", async ({ client, expect }) => {
    const user = await User.factory().hasSettings().create();
    const phoneNumber = "+14155552671";
    const otp = await twoFactorAuthService.createToken(user);
    const response = await client.patch("/api/v1/auth/change-phone-number").actingAs(user.createToken()).json({ phoneNumber, otp });
    await user.refresh();
    response.assertStatus(200);
    expect(user.phoneNumber).toBe(phoneNumber);
  });
  
  test("Shouldn't update phone number with invalid otp", { user: true }, async ({ client, expect }) => {
    const phoneNumber = "+14155552671";
    const response = await client.patch("/api/v1/auth/change-phone-number").loginAs(user).json({ phoneNumber, otp: 123456 });
    await user.refresh();
    response.assertStatus(401);
    expect(user.phoneNumber).not.toBe(phoneNumber);
  });
  
  test("Update phone number should send otp if otp code not provided", { user: true }, async ({ client, expect }) => {
    const phoneNumber = "+14155552671";
    const response = await client.patch("/api/v1/auth/change-phone-number").loginAs(user).json({ phoneNumber });
    const otp = await Token.findOne({ key: user._id, type: "2fa" });
    await user.refresh();
    response.assertStatus(200);
    expect(user.phoneNumber).not.toBe(phoneNumber);
    expect(otp).not.toBeNull();
  });
});
