import { test } from '@japa/runner';
import User from 'App/Models/User';
import { pick } from 'lodash'

/*
Run this suits:
node ace test functional --files="v1/users/list.spec.ts"
*/
test.group("Users / List", group => {
  refreshDatabase(group);
	
	test("Admin should list all users", async ({ client }) => {
    const [admin, users] = await Promise.all([
      User.factory().withRole("admin").create(),
      User.factory().count(2).create()
    ]);
    
    const response = await client.get("/api/v1/users").loginAs(admin);

log(extractProperties(users, ['id']))
    response.assertStatus(200);
    response.assertBodyContains({
      data: pick(users, ['id'])
    });
  });
  
  const extractProperties = (array, properties) => array.map(item => _.pick(item, properties));

  
  test("User shouldn't get users list", async ({ client }) => {
		const user = await User.factory().create();
   
    const response = await client.get("/api/v1/users").loginAs(user);
    
    response.assertStatus(403);
    response.assertBodyNotHaveProperty('data');
  });
})