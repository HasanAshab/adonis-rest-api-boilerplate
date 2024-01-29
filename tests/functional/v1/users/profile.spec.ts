import { test } from '@japa/runner';
import User from 'App/Models/User';
import { pick } from 'lodash';

/*
Run this suits:
node ace test functional --files="v1/users/profile.spec.ts"
*/
test.group("Users / Profile", group => {
  let user;
  
  refreshDatabase(group);

	group.each.setup(async () => {
		user = await User.factory().create();
	});
	
  test("should get profile", async ({ client, expect }) => {
    const response = await client.get("/api/v1/users/me").loginAs(user);
    
    response.assertStatus(200);
    response.assertBodyContains({
      data: pick(user, 'id')
    });
  });

  test("should update profile", async ({ client, expect }) => {
    const response = await client.patch("/api/v1/users/me").loginAs(user).multipart({
      username: "newName",
      profile: fakeFilePath("image.png")
    });
    user = await User.findById(user._id);
    response.assertStatus(200);
    expect(user.username).toBe("newName");
    Notification.assertNothingSent();
    Storage.assertStoredCount(1);
    Storage.assertStored("image.png");
  });

  test("Should update profile without profile", async ({ client, expect }) => {
    const response = await client.patch("/api/v1/users/me").loginAs(user).json({ username: "newName" });
    user = await User.findById(user._id);
    response.assertStatus(200);
    expect(user.username).toBe("newName");
    Storage.assertNothingStored();
  });

  test("Shouldn't update profile with existing username", async ({ client, expect }) => {
    const existingUser = await User.factory().create();
    const usernameBefore = user.username;
    const response = await client.patch("/api/v1/users/me").loginAs(user).json({ username: existingUser.username });
    await user.refresh();
    response.assertStatus(400);
    expect(user.username).toBe(usernameBefore);
  });

  test("Shouldn't update profile with existing email", async ({ client, expect }) => {
    const existingUser = await User.factory().create();
    const response = await client.patch("/api/v1/users/me").loginAs(user).json({ email: existingUser.email });
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
    const response = await client.get("/api/v1/users/" + otherUser.username).loginAs(user);
    response.assertStatus(200);
    expect(response.body.data).toEqualDocument(otherUser.safeDetails());
  });
  
})