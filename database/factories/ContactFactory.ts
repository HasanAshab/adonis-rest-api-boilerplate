import Factory from "~/core/database/Factory";
import { IContact, ContactDocument } from "~/app/models/Contact";

export default class ContactFactory extends Factory<IContact, ContactDocument> {
  definition() {
    return {
      email: this.faker.internet.email(),
      subject: this.faker.lorem.words(5),
      message: this.faker.lorem.words(15),
      status: "opened" as const
    };
  };
  
  closed() {
    return this.state((contact: IContact) => {
      contact.status = "closed";
      return contact;
    });
  }
}