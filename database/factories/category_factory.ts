import Factory from '@ioc:adonis/mongoose/factory'
import Category from '#app/models/category'

export default class CategoryFactory extends Factory<Category> {
  definition() {
    return {
      name: this.faker.commerce.productName(),
      slug: this.faker.lorem.slug(),
      icon: this.faker.internet.url(),
    }
  }
}
