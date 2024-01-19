import Validator from 'App/Http/Validators/Validator';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class ForgotPasswordValidator extends Validator {
	public schema = schema.create({
		email: schema.string([ rules.email() ])
	});
}
