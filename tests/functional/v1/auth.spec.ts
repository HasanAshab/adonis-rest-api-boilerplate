import { test } from '@japa/runner';
import Drive from '@ioc:Adonis/Core/Drive';
import Event from '@ioc:Adonis/Core/Event';
import User from 'App/Models/User';
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService';

/*
describe("Auth", () => {
  
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
