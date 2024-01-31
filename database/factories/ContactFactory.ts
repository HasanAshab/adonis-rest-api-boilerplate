import Factory from '@ioc:Adonis/Mongoose/Factory';
import { IContact, ContactDocument } from 'App/Models/Contact';

export default class ContactFactory extends Factory<IContact, ContactDocument> {
	definition() {
		return {
			email: this.faker.internet.email(),
			subject: this.faker.lorem.words(5),
			message: this.faker.lorem.words(15)
		};
	}

	closed() {
		return this.state((contact: IContact) => {
			contact.status = 'closed';
			return contact;
		});
	}
}
