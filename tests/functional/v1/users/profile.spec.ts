import { test } from '@japa/runner';
import User from 'App/Models/User';


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
	
	test("Should make admin", async ({ client, expect }) => {
    const admin = await User.factory().withRole("admin").create();
    const response = await client.patch(`/api/v1/users/${user.id}/make-admin`).loginAs(admin);
    await user.refresh();
    
    response.assertStatus(200);
    expect(user.role).toBe("admin");
  });
  
  
  test("User Should't make others admin", async ({ client, expect }) => {
    const anotherUser = await User.factory().create();
    
    const response = await client.patch(`/api/v1/users/${anotherUser.id}/make-admin`).loginAs(user);
    await anotherUser.refresh();
    
    response.assertStatus(403);
    expect(anotherUser.role).toBe("user");
  });
})