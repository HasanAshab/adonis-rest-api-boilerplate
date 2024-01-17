import { test } from '@japa/runner';
import Drive from '@ioc:Adonis/Core/Drive';
import Event from '@ioc:Adonis/Core/Event';
import User from 'App/Models/User';
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService';

/*
describe("Auth", () => {
 
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
