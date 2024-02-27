import Factory from '@ioc:adonis/mongoose/factory'
import { ICategory, CategoryDocument } from '#app/models/category'

export default class CategoryFactory extends Factory<ICategory, CategoryDocument> {
  definition() {
    return {
      name: this.faker.commerce.productName(),
      slug: this.faker.lorem.slug(),
      icon: this.faker.internet.url(),
    }
  }
}
