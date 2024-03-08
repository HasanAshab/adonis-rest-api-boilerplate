import Factory from '#models/traits/has_factory/mixin/factory'
import Contact from '#models/contact'

export default class ContactFactory extends Factory<Contact> {
  definition() {
    return {
      email: this.faker.internet.email(),
      subject: this.faker.lorem.words(5),
      message: this.faker.lorem.words(15),
      status: 'opened',
    }
  }

  closed() {
    return this.state((contact) => {
      contact.status = 'closed'
      return contact
    })
  }
}
