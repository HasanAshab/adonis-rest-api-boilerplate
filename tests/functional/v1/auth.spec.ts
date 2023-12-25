import { test } from '@japa/runner'
import Drive from '@ioc:Adonis/Core/Drive'
import Event from '@ioc:Adonis/Core/Event'
import User from "App/Models/User";

//TODO
Event.assertEmitted = () => null;

test.group('Auth', group => {
  let user;
  let token;
  
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


    expect(response.status).toReturnWith(201);
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
      .field("password", "Password@1234")
      .fields(data)
      .file("profile", filePath("image.png"));
    
    const user = await User.findOne(data);
    
    expect(response.status).toReturnWith(201);
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
  }).pin();

  test("shouldn't register with existing email", { user: true }, async () => {
    const response = await request.post("/api/v1/auth/register").json({
      username: "foo",
      email: user.email,
      password: "Password@1234"
    });

    expect(response.status).toReturnWith(422);
    expect(response.body()).not.toHaveProperty("token");
  });
  
  test("shouldn't register with existing username", { user: true }, async () => {
    const response = await request.post("/api/v1/auth/register").multipart({
      username: user.username,
      email: "foo@test.com",
      password: "Password@1234"
    });
    
    expect(response.status).toReturnWith(422);
    expect(response.body()).not.toHaveProperty("data");
  });

  test("should login a user", async () => {
    const response = await request.post("/api/v1/auth/login").json({
      email: user.email,
      password: "password"
    });
    
    expect(response.status).toReturnWith(200);
    expect(response.body()).toHaveProperty("token");
  });

  test("shouldn't login with wrong password", { user: true }, async () => {
    const response = await request.post("/api/v1/auth/login").send({
      email: user.email,
      password: "wrong-pass"
    });
    
    expect(response.status).toReturnWith(401);
    expect(response.body()).not.toHaveProperty("token");
  });

  test("shouldn't login manually in social account", async () => {
    const user = await User.factory().social().create();
    const response = await request.post("/api/v1/auth/login").send({
      email: user.email,
      password: "password"
    });
    
    expect(response.status).toReturnWith(401);
    expect(response.body()).not.toHaveProperty("token");
  });
  
  test("should prevent Brute Force login", { user: true }, async () => {
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
    expect(lockedResponse.status).toReturnWith(429);
  });

  test("Login should flag for otp if not provided in (2FA)", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await request.post("/api/v1/auth/login").send({
      email: user.email,
      password: "password"
    });
    
    expect(response.status).toReturnWith(200);
    expect(response.body().data.twoFactorAuthRequired).toBe(true);
    expect(response.body()).not.toHaveProperty("token");
  });
})

/*
describe("Auth", () => {
  
  const authService = new AuthService();
  const twoFactorAuthService = new TwoFactorAuthService();
  

  test("should login a user with valid otp (2FA)", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const otp = await twoFactorAuthService.createToken(user);
    const response = await request.post("/api/v1/auth/login").send({
      otp,
      email: user.email,
      password: "password"
    });
    expect(response.status).toReturnWith(200);
    expect(response.body().data).toHaveProperty("token");
  });

  test("shouldn't login a user with invalid OTP (2FA)", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await request.post("/api/v1/auth/login").send({
      email: user.email,
      password: "password",
      otp: 999999
    });
    expect(response.status).toReturnWith(401);
    expect(response.body()).not.toHaveProperty("body");
  });
  
  
  test("should login a user with valid recovery code", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const [ code ] = await user.generateRecoveryCodes(1);
    const response = await request.post("/api/v1/auth/login/recovery-code").send({
      email: user.email,
      code
    });
    expect(response.status).toReturnWith(200);
    expect(response.body().data).toHaveProperty("token");
  });
  
  test("shouldn't login a user with same recovery code multiple times", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const [ code ] = await user.generateRecoveryCodes(1);
    const response1 = await request.post("/api/v1/auth/login/recovery-code").send({ email: user.email, code });
    const response2 = await request.post("/api/v1/auth/login/recovery-code").send({ email: user.email, code });
    expect(response1.statusCode).toBe(200);
    expect(response2.statusCode).toBe(401);
    expect(response1.body.data).toHaveProperty("token");
    expect(response2.body).not.toHaveProperty("data");
  });
  
  test("shouldn't login a user with invalid recovery code", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    await user.generateRecoveryCodes(1);
    const response = await request.post("/api/v1/auth/login/recovery-code").send({
      email: user.email,
      code: "foo-bar"
    });
    expect(response.status).toReturnWith(401);
    expect(response.body()).not.toHaveProperty("data");
  });
  
  test("should generate new recovery codes", { user: true }, async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const oldCodes = await user.generateRecoveryCodes();
    const response = await request.post("/api/v1/auth/generate-recovery-codes").actingAs(user.createToken());
    expect(response.status).toReturnWith(200);
    expect(response.body().data).toHaveLength(10);
    expect(response.body().data).not.toEqual(oldCodes);
  });

  test("Should complete social login with username", async () => {
    const username = "FooBar123";
    const externalUser = {
      id: "10000",
      name: "Foo Bar",
      email: "foo@bar.com",
      picture: "www.foo.com"
    };
    const token = await authService.createExternalLoginFinalStepToken("google", externalUser);
    const response = await request.post("/api/v1/auth/login/external/google/final-step").send({ 
      token,
      username,
      externalId: externalUser.id
    });
    const user = await User.findOne({ username });
    expect(response.status).toReturnWith(201);
    expect(user).not.toBeNull();
    expect(await user.settings).not.toBeNull();
    Event.assertEmitted("Registered", {
      user,
      version: "v1",
      method: "social"
    });
  });
  
  test("Should complete social login with email and username", async () => {
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
    const response = await request.post("/api/v1/auth/login/external/google/final-step").send({ 
      token,
      externalId: externalUser.id,
      ...data
    });
    const user = await User.findOne(data);
    expect(response.status).toReturnWith(201);
    expect(user).not.toBeNull();
    expect(await user.settings).not.toBeNull();
    Event.assertEmitted("Registered", {
      user,
      version: "v1",
      method: "social"
    });
  });

  test("Shouldn't complete social login with invalid token", async () => {
    const username = "FooBar123";
    const response = await request.post("/api/v1/auth/login/external/google/final-step").send({
      username,
      token: "invalid-token",
      externalId: "1000"
    });
    const user = await User.findOne({ username });
    expect(response.status).toReturnWith(401);
    expect(user).toBeNull();
  })
  
  test("Shouldn't complete social login with same token multiple times", async () => {
    const externalUser = {
      id: "10000",
      name: "Foo Bar",
      email: "foo@bar.com",
      picture: "www.foo.com"
    };
    const token = await authService.createExternalLoginFinalStepToken("google", externalUser);
    await request.post("/api/v1/auth/login/external/google/final-step").send({ 
      token,
      username: "foo12",
      externalId: externalUser.id
    });
    const response = await request.post("/api/v1/auth/login/external/google/final-step").send({ 
      token,
      username: "foo95",
      externalId: externalUser.id
    });
    expect(response.status).toReturnWith(401);
  });

  test("Should send otp", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await request.post("/api/v1/auth/send-otp/" + user._id);
    await sleep(2000)
    const token = await Token.findOne({ key: user._id, type: "2fa" });
    
    expect(response.status).toReturnWith(200);
    expect(otp).not.toBeNull();
  });
  
  test("should verify email", async () => {
    const user = await User.factory().unverified().create();
    const token = await (new EmailVerificationNotification).createVerificationToken(user);
    const response = await request.get(`/auth/verify/${user._id}/${token}`);
    await user.refresh();
    expect(response.status).toBe(200);
    expect(user.verified).toBe(true);
  });

  test("shouldn't verify email with invalid token", async () => {
    const user = await User.factory().unverified().create();
    const response = await request.get(`/auth/verify/${user._id}/invalid-token`);
    await user.refresh();
    expect(response.status).toBe(401);
    expect(user.verified).toBe(false);
  });

  test("should resend verification email", async () => {
    const user = await User.factory().unverified().create();
    const response = await request.post("/api/v1/auth/verify/resend").send({
      email: user.email
    });

    expect(response.status).toReturnWith(200);
    Notification.assertSentTo(user, EmailVerificationNotification);
  });

  test("should change password", { user: true }, async () => {
    const data = {
      oldPassword: "password",
      newPassword: "Password@1234",
    };
    const response = await request.patch("/api/v1/auth/password/change").actingAs(token).send(data);
    await user.refresh();
    expect(response.status).toReturnWith(200);
    expect(await user.attempt(data.newPassword)).toBe(true);
  });

  test("shouldn't change password of OAuth account", async () => {
    const user = await User.factory().oauth().create();
    const response = await request.patch("/api/v1/auth/password/change").actingAs(user.createToken()).send({
      oldPassword: "password",
      newPassword: "Password@1234"
    });
    expect(response.status).toReturnWith(403);
  });

  test("Should send reset email", { user: true }, async () => {
    const response = await request.post("/api/v1/auth/password/forgot").send({ email: user.email });
    expect(response.status).toReturnWith(202);
    Notification.assertSentTo(user, ForgotPasswordNotification);
  });

  test("Shouldn't send reset email of OAuth account", async () => {
    const user = await User.factory().oauth().create();
    const response = await request.post("/api/v1/auth/password/forgot").send({
      email: user.email
    });
    Notification.assertNothingSent();
  });

  test("should reset password", { user: true }, async () => {
    const token = await (new ForgotPasswordNotification).createForgotPasswordToken(user);
    const password = "Password@1234";
    const response = await request.patch("/api/v1/auth/password/reset").send({
      id: user._id.toString(),
      password,
      token
    });
    await user.refresh();
    expect(response.status).toReturnWith(200);
    expect(await user.attempt(password)).toBe(true);
  });

  test("shouldn't reset password with invalid token", { user: true }, async () => {
    const password = "Password@1234";
    const response = await request.patch("/api/v1/auth/password/reset").send({
      id: user._id.toString(),
      token: "foo",
      password
    });
    await user.refresh();
    expect(response.status).toReturnWith(401);
    expect(await user.attempt(password)).toBe(false);
  });

  test("Should update phone number with valid otp", async () => {
    const user = await User.factory().hasSettings().create();
    const phoneNumber = "+14155552671";
    const otp = await twoFactorAuthService.createToken(user);
    const response = await request.patch("/api/v1/auth/change-phone-number").actingAs(user.createToken()).send({ phoneNumber, otp });
    await user.refresh();
    expect(response.status).toReturnWith(200);
    expect(user.phoneNumber).toBe(phoneNumber);
  });
  
  test("Shouldn't update phone number with invalid otp", { user: true }, async () => {
    const phoneNumber = "+14155552671";
    const response = await request.patch("/api/v1/auth/change-phone-number").actingAs(token).send({ phoneNumber, otp: 123456 });
    await user.refresh();
    expect(response.status).toReturnWith(401);
    expect(user.phoneNumber).not.toBe(phoneNumber);
  });
  
  test("Update phone number should send otp if otp code not provided", { user: true }, async () => {
    const phoneNumber = "+14155552671";
    const response = await request.patch("/api/v1/auth/change-phone-number").actingAs(token).send({ phoneNumber });
    const otp = await Token.findOne({ key: user._id, type: "2fa" });
    await user.refresh();
    expect(response.status).toReturnWith(200);
    expect(user.phoneNumber).not.toBe(phoneNumber);
    expect(otp).not.toBeNull();
  });
});
*/