import Validator from 'App/Http/Validators/Validator';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class ResetPasswordValidator extends Validator {
	public schema = schema.create({
		id: schema.number(),
		token: schema.string(),
		password: schema.string([
		  rules.password(),
		  rules.maxLength(128)
		]),
	});
}
