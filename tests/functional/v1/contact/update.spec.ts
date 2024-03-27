import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import type Contact from '#models/contact'
import { UserFactory } from '#factories/user_factory'
import { ContactFactory } from '#factories/contact_factory'


/*
Run this suits:
node ace test functional --files="v1/contact/update.spec.ts"
*/
test.group('Contact / Update', (group) => {
  let contact: Contact

  refreshDatabase(group)

  test('Should close contact', async ({ client, expect }) => {
    contact = await ContactFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const response = await client
      .patch(`/api/v1/contact/inquiries/${contact.id}/status`)
      .loginAs(admin)
      .json({ status: 'closed' })

    await contact.refresh()

    response.assertStatus(200)
    expect(contact.isClosed()).toBeTrue()
  })

  test('Should reopen contact', async ({ client, expect }) => {
    contact = await ContactFactory.apply('closed').create()
    const admin = await UserFactory.apply('admin').create()

    const response = await client
      .patch(`/api/v1/contact/inquiries/${contact.id}/status`)
      .loginAs(admin)
      .json({ status: 'opened' })
    await contact.refresh()

    response.assertStatus(200)
    expect(contact.isOpened()).toBeTrue()
  })

  test('Users should not close contact', async ({ client, expect }) => {
    contact = await ContactFactory.create()
    const user = await UserFactory.create()

    const response = await client
      .patch(`/api/v1/contact/inquiries/${contact.id}/status`)
      .loginAs(user)
      .json({ status: 'closed' })
    await contact.refresh()

    response.assertStatus(403)
    expect(contact.isClosed()).toBeFalse()
  })

  test('Users should not reopen contact', async ({ client, expect }) => {
    contact = await ContactFactory.apply('closed').create()
    const user = await UserFactory.create()

    const response = await client
      .patch(`/api/v1/contact/inquiries/${contact.id}/status`)
      .loginAs(user)
      .json({ status: 'opened' })
    await contact.refresh()

    response.assertStatus(403)
    expect(contact.isOpened()).toBeFalse()
  })
})
