import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import Contact from '#models/contact'

/*
Run this suits:
node ace test functional --files="v1/contact/suggest.spec.ts"
*/
test.group('Contact / Suggest', (group) => {
  const message = 'I discovered a bug in your website'

  refreshDatabase(group)

  test('Should suggest contacts', async ({ client }) => {
    const admin = await UserFactory.withRole('admin').create()
    const contact = await ContactFactory.create({ message })

    const response = await client.get('/api/v1/contact/inquiries/suggest').loginAs(admin).qs({
      q: 'website bug',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      data: [contact.subject],
    })
  })

  test('Users should not get contacts suggestion', async ({ client }) => {
    const user = await UserFactory.create()
    const contact = await ContactFactory.create({ message })

    const response = await client.get('/api/v1/contact/inquiries/suggest').loginAs(user).qs({
      q: 'website bug',
    })

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })

  test('Should filter contacts suggestion', async ({ client }) => {
    const admin = await UserFactory.withRole('admin').create()
    const [openedContact] = await Promise.all([
      ContactFactory.create({ message }),
      ContactFactory.closed().create({ message }),
    ])
    const response = await client.get('/api/v1/contact/inquiries/suggest').loginAs(admin).qs({
      q: 'website bug',
      status: 'opened',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      data: [openedContact.subject],
    })
  })
})
