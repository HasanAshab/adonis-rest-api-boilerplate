import Validator from 'App/Http/Validators/Validator';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class RegisterValidator extends Validator {
	public schema = schema.create({
		email: schema.string([
			rules.email(),
			rules.maxLength(254),
			rules.unique({
				table: 'users',
				column: 'email',
			}),
		]),

		username: schema.string([
			rules.alphaNum(),
			rules.range(3, 20),
			rules.unique({
				table: 'users',
				column: 'username',
			}),
		]),

		password: schema.string([
		  rules.password(),
		  rules.maxLength(128)
		]),

		profile: schema.file.optional({
			size: '1mb',
			extnames: ['jpg', 'png'],
		}),
	});
}
