import { test } from '@japa/runner'


test.group('Auth/Password', group => {
  group.each.setup(async () => {
    await resetDatabase(); 

    //Notification.restore();
    Event.restore();
    
    user = await User.factory().hasSettings().create();
    token = user.createToken();
  });
  
  test("Should send reset email", async ({ client, expect }) => {
    const response = await client.post("/api/v1/auth/password/forgot").json({ email: user.email });
    expect(response.status()).toBe(202);
    Notification.assertSentTo(user, ForgotPasswordNotification);
  });

  test("Shouldn't send reset email of social account", async ({ client, expect }) => {
    const user = await User.factory().social().create();
    const response = await client.post("/api/v1/auth/password/forgot").json({ email: user.email });
    Notification.assertNothingSent();
  });

  test("should reset password", async ({ client, expect }) => {
    const token = await new ForgotPasswordNotification().createForgotPasswordToken(user);
    const password = "Password@1234";
    const response = await client.patch("/api/v1/auth/password/reset").json({
      id: user._id.toString(),
      password,
      token
    });
    await user.refresh();
    expect(response.status()).toBe(200);
    expect(await user.attempt(password)).toBe(true);
  });

  test("shouldn't reset password with invalid token", async ({ client, expect }) => {
    const password = "Password@1234";
    const response = await client.patch("/api/v1/auth/password/reset").json({
      id: user._id.toString(),
      token: "foo",
      password
    });
    await user.refresh();
    expect(response.status()).toBe(401);
    expect(await user.attempt(password)).toBe(false);
  });



});