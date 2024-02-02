import { test } from '@japa/runner';
import User from 'App/Models/User';
import Contact from 'App/Models/Contact';


/*
Run this suits:
node ace test functional --files="v1/contact/delete.spec.ts"
*/
test.group("Contact / Delete", group => {
  let contact: Contact;
  
  refreshDatabase(group);
  
  group.each.setup(async () => {
    contact = await Contact.factory().create();
	});
	
	test("Should delete contact", async ({ client, expect }) => {
    const admin = await User.factory().withRole('admin').create();

    const response = await client.delete("/api/v1/contact/inquiries/" + contact.id).loginAs(admin);
    
    response.assertStatus(204);
    await expect(contact.exists()).resolves.toBe(false);
  });
	
	test("Users should not delete contact", async ({ client, expect }) => {
    const user = await User.factory().create();

    const response = await client.delete("/api/v1/contact/inquiries/" + contact.id).loginAs(user);
    
    response.assertStatus(403);
    await expect(contact.exists()).resolves.toBe(true);
  });
});