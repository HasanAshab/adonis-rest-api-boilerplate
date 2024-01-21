import Validator from 'App/Http/Validators/Validator';
import { schema } from '@ioc:Adonis/Core/Validator';

export default class SocialAuthTokenLoginValidator extends Validator {
	public schema = schema.create({
		token: schema.string(),
	});
}
