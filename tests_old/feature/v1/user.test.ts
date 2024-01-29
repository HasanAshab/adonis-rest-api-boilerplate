import DB from "DB";
import User from "~/app/models/User";
import Storage from "Storage";
import Notification from "Notification";
import EmailVerificationNotification from "~/app/notifications/EmailVerificationNotification";

describe("user", () => {
  let user;
  let token;
  
  beforeAll(async ({ client, expect }) => {
    await DB.connect();
  });
  
  beforeEach(async (config) => {
    await DB.reset();
    Notification.mockClear();
    Storage.mockClear();
    if(config.user !== false) {
      user = await User.factory().create();
      token = user.createToken();
    }
  });
  
  test("Admin should get all users", { user: false }, async ({ client, expect }) => {
    const [admin, users] = await Promise.all([
      User.factory().withRole("admin").create(),
      User.factory().count(2).create()
    ]);
    const response = await client.get("/api/v1/api/v1/users").loginAs(admin);
    response.assertStatus(200);
    expect(response.body.data).toEqualDocument(users);
  });
  
  test("Novice user shouldn't get all users", async ({ client, expect }) => {
    const response = await client.get("/api/v1/users").loginAs(token);
    response.assertStatus(403);
    expect(response.body).not.toHaveProperty("data");
  });
  
  test("should get profile", async ({ client, expect }) => {
    const response = await client.get("/api/v1/users/me").loginAs(token);
    response.assertStatus(200);
    delete user.password;
    expect(response.body.data).toEqualDocument(user);
  });

  test("should update profile", async ({ client, expect }) => {
    const response = await client.patch("/api/v1/users/me").loginAs(token).multipart({
      username: "newName",
      profile: fakeFile("image.png")
    });
    user = await User.findById(user._id);
    response.assertStatus(200);
    expect(user.username).toBe("newName");
    Notification.assertNothingSent();
    Storage.assertStoredCount(1);
    Storage.assertStored("image.png");
  });

  test("Should update profile without profile", async ({ client, expect }) => {
    const response = await client.patch("/api/v1/users/me").loginAs(token).json({ username: "newName" });
    user = await User.findById(user._id);
    response.assertStatus(200);
    expect(user.username).toBe("newName");
    Storage.assertNothingStored();
  });

  test("Shouldn't update profile with existing username", async ({ client, expect }) => {
    const existingUser = await User.factory().create();
    const usernameBefore = user.username;
    const response = await client.patch("/api/v1/users/me").loginAs(token).json({ username: existingUser.username });
    await user.refresh();
    response.assertStatus(400);
    expect(user.username).toBe(usernameBefore);
  });

  test("Shouldn't update profile with existing email", async ({ client, expect }) => {
    const existingUser = await User.factory().create();
    const response = await client.patch("/api/v1/users/me").loginAs(token).json({ email: existingUser.email });
    const userAfterRequest = await User.findById(user._id);
    response.assertStatus(400);
    expect(userAfterRequest.email).toBe(user.email);
    Notification.assertNothingSent();
  });

  test("updating email should send verification email", async ({ client, expect }) => {
    const email = "foo@test.com";
    const response = await client.patch("/api/v1/api/v1/users/me").json({ email });
    user = await User.findById(user._id);
    response.assertStatus(200);
    expect(user.email).toBe(email);
    Notification.assertSentTo(user, EmailVerificationNotification);
  });

  test("Should get other user's profile by username", async ({ client, expect }) => {
    const otherUser = await User.factory().create();
    const response = await client.get("/api/v1/users/" + otherUser.username).loginAs(token);
    response.assertStatus(200);
    expect(response.body.data).toEqualDocument(otherUser.safeDetails());
  });
});
