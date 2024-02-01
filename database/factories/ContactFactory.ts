import Factory from 'App/Models/Traits/HasFactory/Factory';
import Contact from 'App/Models/Contact';

export default class ContactFactory extends Factory<Contact> {
	definition() {
		return {
			email: this.faker.internet.email(),
			subject: this.faker.lorem.words(5),
			message: this.faker.lorem.words(15)
		};
	}

	closed() {
		return this.state(contact => {
			contact.status = 'closed';
			return contact;
		});
	}
}
