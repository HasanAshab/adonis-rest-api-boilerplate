import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import Contact from '#models/contact'
import ListContactResource from '#resources/v1/contact/list_contact_resource'

/*
Run this suits:
node ace test functional --files="v1/contact/search.spec.ts"
*/
test.group('Contact / Search', (group) => {
  const message = 'I discovered a bug in your website'

  refreshDatabase(group)

  test('Should search contacts', async ({ client }) => {
    const admin = await User.factory().withRole('admin').create()
    const contact = await Contact.factory().create({ message })

    const response = await client.get('/api/v1/contact/inquiries/search').loginAs(admin).qs({
      q: 'website bug',
    })

    response.assertStatus(200)
    response.assertBodyContains(ListContactResource.collection([contact]))
  })

  test('Users should not search contacts', async ({ client }) => {
    const user = await User.factory().create()
    const contact = await Contact.factory().create({ message })

    const response = await client.get('/api/v1/contact/inquiries/search').loginAs(user).qs({
      q: 'website bug',
    })

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })

  test('Should filter search contacts', async ({ client }) => {
    const admin = await User.factory().withRole('admin').create()
    const [openedContact] = await Promise.all([
      Contact.factory().create({ message }),
      Contact.factory().closed().create({ message }),
    ])

    const response = await client.get('/api/v1/contact/inquiries/search').loginAs(admin).qs({
      q: 'website bug',
      status: 'opened',
    })

    response.assertStatus(200)
    response.assertBodyContains(ListContactResource.collection([openedContact]))
  })
})
