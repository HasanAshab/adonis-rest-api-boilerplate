import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import { UserFactory } from '#factories/user_factory'
import { ContactFactory } from '#factories/contact_factory'

/*
Run this suits:
node ace test functional --files="v1/contact/search.spec.ts"
*/
test.group('Contact / Search', (group) => {
  const message = 'I discovered a bug in your website'

  refreshDatabase(group)

  test('Should search contacts', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const contact = await ContactFactory.merge({ message }).create()

    const response = await client.get('/api/v1/contact/inquiries/search').loginAs(admin).qs({
      q: 'website bug',
    })

    response.assertStatus(200)
    response.assertBodyContains(ListContactResource.collection([contact]))
    response.assertBodyHaveProperty('data[0].id', contact.id)
  })

  test('Users should not search contacts', async ({ client }) => {
    const user = await UserFactory.create()
    const contact = await ContactFactory.merge({ message }).create()

    const response = await client.get('/api/v1/contact/inquiries/search').loginAs(user).qs({
      q: 'website bug',
    })

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })

  test('Should filter search contacts', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const [openedContact] = await Promise.all([
      ContactFactory.merge({ message }).create(),
      ContactFactory.apply('closed').create({ message }),
    ])

    const response = await client.get('/api/v1/contact/inquiries/search').loginAs(admin).qs({
      q: 'website bug',
      status: 'opened',
    })

    response.assertStatus(200)
    response.assertBodyHaveProperty('data[0].id', openedContact.id)
  })
})
