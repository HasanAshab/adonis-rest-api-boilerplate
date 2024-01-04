import { PasswordValidationStrategy } from '@ioc:Adonis/Core/Validator/Rules/Password';

export default class WeakPasswordStrategy
	implements PasswordValidationStrategy
{
	message = 'must be at least 6 characters long';

	validate(value: unknown) {
		return value.length >= 6;
	}
}
