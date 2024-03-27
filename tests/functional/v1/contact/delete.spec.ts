import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import Contact from '#models/contact'
import { UserFactory } from '#factories/user_factory'
import { ContactFactory } from '#factories/contact_factory'

/*
Run this suits:
node ace test functional --files="v1/contact/delete.spec.ts"
*/
test.group('Contact / Delete', (group) => {
  let contact: Contact

  refreshDatabase(group)

  group.each.setup(async () => {
    contact = await ContactFactory.create()
  })

  test('Should delete contact', async ({ client, expect }) => {
    const admin = await UserFactory.apply('admin').create()

    const response = await client.delete('/api/v1/contact/inquiries/' + contact.id).loginAs(admin)

    response.assertStatus(204)
    await expect(contact.exists()).resolves.toBeFalse()
  })

  test('Users should not delete contact', async ({ client, expect }) => {
    const user = await UserFactory.create()

    const response = await client.delete('/api/v1/contact/inquiries/' + contact.id).loginAs(user)

    response.assertStatus(403)
    await expect(contact.exists()).resolves.toBeTrue()
  })
})
