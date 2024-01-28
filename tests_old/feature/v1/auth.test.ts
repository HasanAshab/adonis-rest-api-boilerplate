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

  it.only("should register a user", async () => {
    const data = {
      username: "foobar123",
      email: "foo@gmail.com",
      password: "Password@1234",
      profile: fakeFile("image.png")
    };
    const response = await request.post("/api/v1/auth/register").multipart(data);
    const user = await User.findOne({ email: data.email });
    expect(response.statusCode).toBe(201);
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

  it("should register a user without profile", async () => {
    const data = {
      username: "foobar123",
      email: "foo@gmail.com",
      password: "Password@1234"
    };
    const response = await request.post("/api/v1/auth/register").multipart(data);
    const user = await User.findOne({ email: data.email });
    expect(response.statusCode).toBe(201);
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

  it("shouldn't register with existing email", { user: true }, async () => {
    const response = await request.post("/api/v1/auth/register").multipart({
      username: "foo",
      email: user.email,
      password: "Password@1234"
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).not.toHaveProperty("data");
  });

  it("shouldn't register with existing username", { user: true }, async () => {
    const response = await request.post("/api/v1/auth/register").multipart({
      username: user.username,
      email: "foo@test.com",
      password: "Password@1234"
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).not.toHaveProperty("data");
  });

  it("should login a user", async () => {
    const user = await User.factory().hasSettings().create();
    const response = await request.post("/api/v1/auth/login").send({
      email: user.email,
      password: "password"
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty("token");
  });

  it("shouldn't login with wrong password", { user: true }, async () => {
    const response = await request.post("/api/v1/auth/login").send({
      email: user.email,
      password: "wrong-pass"
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.data?.token).toBe(undefined);
  });
    
  it("shouldn't login manually in OAuth account", async () => {
    const user = await User.factory().oauth().create();
    const response = await request.post("/api/v1/auth/login").send({
      email: user.email,
      password: "password"
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.data?.token).toBe(undefined);
  });

  it("Login should flag for otp if not provided in (2FA)", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await request.post("/api/v1/auth/login").send({
      email: user.email,
      password: "password"
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.data.twoFactorAuthRequired).toBe(true);
    expect(response.body.data).not.toHaveProperty("token");
  });

  it("should login a user with valid otp (2FA)", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const otp = await twoFactorAuthService.createToken(user);
    const response = await request.post("/api/v1/auth/login").send({
      otp,
      email: user.email,
      password: "password"
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty("token");
  });

  it("shouldn't login a user with invalid OTP (2FA)", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await request.post("/api/v1/auth/login").send({
      email: user.email,
      password: "password",
      otp: 999999
    });
    expect(response.statusCode).toBe(401);
    expect(response.body).not.toHaveProperty("body");
  });
  
  it("should prevent Brute Force login", { user: true }, async () => {
    const payload = {
      email: user.email,
      password: "wrong-pass"
    };
    const responses = [];
    for (let i = 0; i < 5; i++) {
      const response = await request.post("/api/v1/auth/login").send(payload);
      responses.push(response);
    }
    expect(responses[0].statusCode).toBe(401);
    expect(responses[1].statusCode).toBe(401);
    expect(responses[2].statusCode).toBe(401);
    expect(responses[3].statusCode).toBe(401);
    expect(responses[4].statusCode).toBe(429);
  });
  
  it("should login a user with valid recovery code", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const [ code ] = await user.generateRecoveryCodes(1);
    const response = await request.post("/api/v1/auth/login/recovery-code").send({
      email: user.email,
      code
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty("token");
  });
  
  it("shouldn't login a user with same recovery code multiple times", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const [ code ] = await user.generateRecoveryCodes(1);
    const response1 = await request.post("/api/v1/auth/login/recovery-code").send({ email: user.email, code });
    const response2 = await request.post("/api/v1/auth/login/recovery-code").send({ email: user.email, code });
    expect(response1.statusCode).toBe(200);
    expect(response2.statusCode).toBe(401);
    expect(response1.body.data).toHaveProperty("token");
    expect(response2.body).not.toHaveProperty("data");
  });
  
  it("shouldn't login a user with invalid recovery code", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    await user.generateRecoveryCodes(1);
    const response = await request.post("/api/v1/auth/login/recovery-code").send({
      email: user.email,
      code: "foo-bar"
    });
    expect(response.statusCode).toBe(401);
    expect(response.body).not.toHaveProperty("data");
  });
  
  it("should generate new recovery codes", { user: true }, async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const oldCodes = await user.generateRecoveryCodes();
    const response = await request.post("/api/v1/auth/generate-recovery-codes").actingAs(user.createToken());
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(10);
    expect(response.body.data).not.toEqual(oldCodes);
  });

  it("Should complete social login with username", async () => {
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
    expect(response.statusCode).toBe(201);
    expect(user).not.toBeNull();
    expect(await user.settings).not.toBeNull();
    Event.assertEmitted("Registered", {
      user,
      version: "v1",
      method: "social"
    });
  });
  
  it("Should complete social login with email and username", async () => {
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
    expect(response.statusCode).toBe(201);
    expect(user).not.toBeNull();
    expect(await user.settings).not.toBeNull();
    Event.assertEmitted("Registered", {
      user,
      version: "v1",
      method: "social"
    });
  });

  it("Shouldn't complete social login with invalid token", async () => {
    const username = "FooBar123";
    const response = await request.post("/api/v1/auth/login/external/google/final-step").send({
      username,
      token: "invalid-token",
      externalId: "1000"
    });
    const user = await User.findOne({ username });
    expect(response.statusCode).toBe(401);
    expect(user).toBeNull();
  })
  
  it("Shouldn't complete social login with same token multiple times", async () => {
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
    expect(response.statusCode).toBe(401);
  });

  it("Should send otp", async () => {
    const user = await User.factory().withPhoneNumber().hasSettings(true).create();
    const response = await request.post("/api/v1/auth/send-otp/" + user._id);
    await sleep(2000)
    const token = await Token.findOne({ key: user._id, type: "2fa" });
    
    expect(response.statusCode).toBe(200);
    expect(otp).not.toBeNull();
  });
  
  it("should verify email", async () => {
    const user = await User.factory().unverified().create();
    const token = await (new EmailVerificationNotification).createVerificationToken(user);
    const response = await request.get(`/auth/verify/${user._id}/${token}`);
    await user.refresh();
    expect(response.status).toBe(200);
    expect(user.verified).toBe(true);
  });

  it("shouldn't verify email with invalid token", async () => {
    const user = await User.factory().unverified().create();
    const response = await request.get(`/auth/verify/${user._id}/invalid-token`);
    await user.refresh();
    expect(response.status).toBe(401);
    expect(user.verified).toBe(false);
  });

  it("should resend verification email", async () => {
    const user = await User.factory().unverified().create();
    const response = await request.post("/api/v1/auth/verify/resend").send({
      email: user.email
    });

    expect(response.statusCode).toBe(200);
    Notification.assertSentTo(user, EmailVerificationNotification);
  });

  it("should change password", { user: true }, async () => {
    const data = {
      oldPassword: "password",
      newPassword: "Password@1234",
    };
    const response = await request.patch("/api/v1/auth/password/change").actingAs(token).send(data);
    await user.refresh();
    expect(response.statusCode).toBe(200);
    expect(await user.attempt(data.newPassword)).toBe(true);
  });

  it("shouldn't change password of OAuth account", async () => {
    const user = await User.factory().oauth().create();
    const response = await request.patch("/api/v1/auth/password/change").actingAs(user.createToken()).send({
      oldPassword: "password",
      newPassword: "Password@1234"
    });
    expect(response.statusCode).toBe(403);
  });

  it("Should send reset email", { user: true }, async () => {
    const response = await request.post("/api/v1/auth/password/forgot").send({ email: user.email });
    expect(response.statusCode).toBe(202);
    Notification.assertSentTo(user, ForgotPasswordNotification);
  });

  it("Shouldn't send reset email of OAuth account", async () => {
    const user = await User.factory().oauth().create();
    const response = await request.post("/api/v1/auth/password/forgot").send({
      email: user.email
    });
    Notification.assertNothingSent();
  });

  it("should reset password", { user: true }, async () => {
    const token = await (new ForgotPasswordNotification).createForgotPasswordToken(user);
    const password = "Password@1234";
    const response = await request.patch("/api/v1/auth/password/reset").send({
      id: user._id.toString(),
      password,
      token
    });
    await user.refresh();
    expect(response.statusCode).toBe(200);
    expect(await user.attempt(password)).toBe(true);
  });

  it("shouldn't reset password with invalid token", { user: true }, async () => {
    const password = "Password@1234";
    const response = await request.patch("/api/v1/auth/password/reset").send({
      id: user._id.toString(),
      token: "foo",
      password
    });
    await user.refresh();
    expect(response.statusCode).toBe(401);
    expect(await user.attempt(password)).toBe(false);
  });

  it("Should update phone number with valid otp", async () => {
    const user = await User.factory().hasSettings().create();
    const phoneNumber = "+14155552671";
    const otp = await twoFactorAuthService.createToken(user);
    const response = await request.patch("/api/v1/auth/change-phone-number").actingAs(user.createToken()).send({ phoneNumber, otp });
    await user.refresh();
    expect(response.statusCode).toBe(200);
    expect(user.phoneNumber).toBe(phoneNumber);
  });
  
  it("Shouldn't update phone number with invalid otp", { user: true }, async () => {
    const phoneNumber = "+14155552671";
    const response = await request.patch("/api/v1/auth/change-phone-number").actingAs(token).send({ phoneNumber, otp: 123456 });
    await user.refresh();
    expect(response.statusCode).toBe(401);
    expect(user.phoneNumber).not.toBe(phoneNumber);
  });
  
  it("Update phone number should send otp if otp code not provided", { user: true }, async () => {
    const phoneNumber = "+14155552671";
    const response = await request.patch("/api/v1/auth/change-phone-number").actingAs(token).send({ phoneNumber });
    const otp = await Token.findOne({ key: user._id, type: "2fa" });
    await user.refresh();
    expect(response.statusCode).toBe(200);
    expect(user.phoneNumber).not.toBe(phoneNumber);
    expect(otp).not.toBeNull();
  });
});
