import Validator from 'App/Http/Validators/Validator';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class ResetPasswordValidator extends Validator {
	public schema = schema.create({
		token: schema.string(),
		id: schema.string([
			//rules.objectId()
		]),
		password: schema.string([rules.password()]),
	});
}
