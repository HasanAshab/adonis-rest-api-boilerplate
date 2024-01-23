import Validator from 'App/Http/Validators/Validator';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class SocialAuthTokenLoginValidator extends Validator {
	public schema = schema.create({
		token: schema.string(),
		
		email: schema.string.optional([
			rules.email(),
			rules.maxLength(254)
		]),

		username: schema.string.optional([
			rules.alphaNum(),
			rules.lengthRange(3, 20)
		]),
	});
}
