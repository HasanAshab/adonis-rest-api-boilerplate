import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import Contact from '#models/contact'

/*
Run this suits:
node ace test functional --files="v1/contact/post.spec.ts"
*/
test.group('Contact / Post', (group) => {
  test('Should post contact', async ({ client, expect }) => {
    const data = {
      email: 'test@gmail.com',
      subject: 'Just Testing',
      message: 'bla'.repeat(10),
    }

    const response = await client.post('/api/v1/contact').json(data)

    response.assertStatus(201)
    await expect(Contact.findByFields(data)).resolves.not.toBeNull()
  })
})
