import { test } from '@japa/runner'
import User from 'App/Models/User'
import Contact from 'App/Models/Contact'

/*
Run this suits:
node ace test functional --files="v1/contact/update.spec.ts"
*/
test.group('Contact / Update', (group) => {
  let contact: Contact

  refreshDatabase(group)


  test('Should close contact', async ({ client, expect }) => {
    const contact = await Contact.factory().create()
    const admin = await User.factory().withRole('admin').create()

    const response = await client.patch(`/api/v1/contact/inquiries/${contact.id}/close`).loginAs(admin)
    await contact.refresh()

    response.assertStatus(200)
    expect(contact.status).toBe('closed')
  })
  
  test('Should reopen contact', async ({ client, expect }) => {
    const contact = await Contact.factory().closed().create()
    const admin = await User.factory().withRole('admin').create()

    const response = await client.patch(`/api/v1/contact/inquiries/${contact.id}/reopen`).loginAs(admin)
    await contact.refresh()

    response.assertStatus(200)
    expect(contact.status).toBe('opened')
  })

  test('Users should not close contact', async ({ client, expect }) => {
    const contact = await Contact.factory().create()
    const user = await User.factory().create()

    const response = await client.patch(`/api/v1/contact/inquiries/${contact.id}/close`).loginAs(user)
    await contact.refresh()

    response.assertStatus(403)
    expect(contact.status).toBe('opened')
  })
  
  test('Users should not reopen contact', async ({ client, expect }) => {
    const contact = await Contact.factory().closed().create()
    const user = await User.factory().create()

    const response = await client.patch(`/api/v1/contact/inquiries/${contact.id}/reopen`).loginAs(user)
    await contact.refresh()

    response.assertStatus(403)
    expect(contact.status).toBe('closed')
  })
})
