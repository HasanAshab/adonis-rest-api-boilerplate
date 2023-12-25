import Factory from "~/core/database/Factory";
import { ICategory, CategoryDocument } from "~/app/models/Category";

export default class CategoryFactory extends Factory<ICategory, CategoryDocument> {
  definition() {
    return {
      name: this.faker.commerce.productName(),
      slug: this.faker.lorem.slug(),
      icon: this.faker.internet.url()
    }
  };
}