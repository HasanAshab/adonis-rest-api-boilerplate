import Validator from 'App/Http/Validators/Validator';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class UpdateProfileValidator extends Validator {
	public schema = schema.create({
    name: schema.string.optional([
      rules.lengthRange(3, 25),
      rules.sanitize()
    ]),
    username: schema.string.optional([
      rules.alphaNum(),
			rules.lengthRange(3, 20),
			rules.unique({
				table: 'users',
				column: 'username',
			})
    ]),
    email: schema.string.optional([
			rules.email(),
			rules.maxLength(254),
			rules.unique({
				table: 'users',
				column: 'email',
			}),
		]),
		avatar: schema.file.optional({
			size: '1mb',
			extnames: ['jpg', 'png'],
		})
	});
}