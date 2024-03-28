import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import { UserFactory } from '#factories/user_factory'
import { ContactFactory } from '#factories/contact_factory'

/*
Run this suits:
node ace test functional --files="v1/contact/autocomplete_search.spec.ts"
*/
test.group('Contact / Autocomplete Search', (group) => {
  const message = 'I discovered a bug in your website'

  refreshDatabase(group)

  test('Should autocomplete contacts searching', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const contact = await ContactFactory.merge({ message }).create()

    const response = await client.get('/api/v1/contact/inquiries/autocomplete-search').loginAs(admin).qs({
      q: 'website bug',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      data: [contact.subject],
    })
  })

  test('Users should not access contacts search autocomplete', async ({ client }) => {
    const user = await UserFactory.create()
    const contact = await ContactFactory.merge({ message }).create()

    const response = await client.get('/api/v1/contact/inquiries/autocomplete-search').loginAs(user).qs({
      q: 'website bug'
    })

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })

  test('Should filter contacts search autocomplete', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const [openedContact] = await Promise.all([
      ContactFactory.merge({ message }).create(),
      ContactFactory.apply('closed').create({ message }),
    ])
    const response = await client.get('/api/v1/contact/inquiries/autocomplete-search').loginAs(admin).qs({
      q: 'website bug',
      status: 'opened',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      data: [openedContact.subject],
    })
  })
})
