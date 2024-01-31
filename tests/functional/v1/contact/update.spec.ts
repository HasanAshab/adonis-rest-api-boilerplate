import { test } from '@japa/runner';
import User from 'App/Models/User';
import Contact from 'App/Models/Contact';


/*
Run this suits:
node ace test functional --files="v1/contact/update.spec.ts"
*/
test.group("Contact / Update", group => {
  let contact: Contact;
  
  refreshDatabase(group);
  
  group.each.setup(async () => {
    contact = await Contact.factory().create();
	});
	
  test("Should update contact status", async ({ client, expect }) => {
    const admin = await User.factory().withRole('admin').create();
    
    const response = await client.patch(`/contact/inquiries/${contact.id}/status`).loginAs(admin).json({ status: "closed" });
    await contact.refresh(); 

    response.assertStatus(200);
    expect(contact.status).toBe("closed");
  });
  
  test("Users should not update contact status", async ({ client, expect }) => {
		const user = await User.factory().create();

    const response = await client.patch(`/contact/inquiries/${contact.id}/status`).loginAs(user).json({ status: "closed" });
    await contact.refresh(); 

    response.assertStatus(403);
    expect(contact.status).toBe("opened");
  });
})