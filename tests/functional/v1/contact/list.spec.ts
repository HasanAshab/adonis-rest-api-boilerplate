import { test } from '@japa/runner'
import User from '#app/models/user'
import Contact from '#app/models/contact'
import { extract } from '#app/helpers'
import ListContactResource from '#app/http/resources/v1/contact/list_contact_resource'
import ShowContactResource from '#app/http/resources/v1/contact/show_contact_resource'

/*
Run this suits:
node ace test functional --files="v1/contact/list.spec.ts"
*/
test.group('Contact / List', (group) => {
  let admin: User

  refreshDatabase(group)

  group.each.setup(async () => {
    admin = await User.factory().withRole('admin').create()
  })

  test('Should list contacts', async ({ client }) => {
    const contacts = await Contact.factory().count(2).create()

    const response = await client.get('/api/v1/contact/inquiries').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains(ListContactResource.collection(contacts))
  })

  test('Users should not get contacts list', async ({ client }) => {
    const user = await User.factory().create()
    const contacts = await Contact.factory().count(2).create()

    const response = await client.get('/api/v1/contact/inquiries').loginAs(user)

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })

  test('Should get contact', async ({ client }) => {
    const contact = await Contact.factory().create()

    const response = await client.get('/api/v1/contact/inquiries/' + contact.id).loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains(ShowContactResource.make(contact))
  })

  test('Users should not get contact', async ({ client }) => {
    const user = await User.factory().create()
    const contact = await Contact.factory().create()

    const response = await client.get('/api/v1/contact/inquiries/' + contact.id).loginAs(user)

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })
})
