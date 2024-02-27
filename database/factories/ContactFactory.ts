import Factory from '#app/Models/Traits/HasFactory/Factory'
import Contact from '#app/Models/Contact'

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
