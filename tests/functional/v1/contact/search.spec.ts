import { test } from '@japa/runner'
import User from 'App/Models/User'
import Contact from 'App/Models/Contact'
import { extract } from 'App/helpers'

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

    const response = await client.get('/api/v1/contact/inquiries/search').loginAs(admin).query({
      q: 'website bug',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      data: [extract(contact, 'id')],
    })
  })

  test('Users should not search contacts', async ({ client }) => {
    const user = await User.factory().create()
    const contact = await Contact.factory().create({ message })

    const response = await client.get('/api/v1/contact/inquiries/search').loginAs(user).query({
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
    
    const response = await client.get('/api/v1/contact/inquiries/search').loginAs(admin).query({
      q: 'website bug',
      status: 'opened',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      data: [extract(openedContact, 'id')],
    })
  })
})
