import Validator from 'App/Http/Validators/Validator';
import { schema, rules } from '@ioc:Adonis/Core/Validator';

export default class RegisterValidator extends Validator {
	public schema = schema.create({
		enable: schema.boolean(),
    method: schema.enum.optional(['sms', 'call', 'app'] as const)
	});
}