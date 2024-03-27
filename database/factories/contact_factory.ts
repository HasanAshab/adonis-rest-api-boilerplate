import factory from '@adonisjs/lucid/factories'
import Contact from '#models/contact'

export const ContactFactory = factory
  .define(Contact, async ({ faker }) => {
    return  {
      email: faker.internet.email(),
      subject: faker.lorem.words(5),
      message: faker.lorem.words(15)
    }
  })
  .state('closed', contact => (contact.status = 'closed'))
  .build()