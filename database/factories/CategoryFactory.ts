import Factory from '@ioc:Adonis/Mongoose/Factory';
import { ICategory, CategoryDocument } from 'App/Models/Category';

export default class CategoryFactory extends Factory<
	ICategory,
	CategoryDocument
> {
	definition() {
		return {
			name: this.faker.commerce.productName(),
			slug: this.faker.lorem.slug(),
			icon: this.faker.internet.url(),
		};
	}
}
