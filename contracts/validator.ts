declare module '@ioc:Adonis/Core/Validator' {
	type PasswordStrategy = 'complex' | 'standard' | 'weak';

	interface Rules {
		slug(): Rule;
		password(strategy?: PasswordStrategy): Rule;
	}
}

declare module '@ioc:Adonis/Core/Validator/Rules/Password' {
  import type PasswordStrategyManagerContract from 'App/Providers/ValidationProvider/Password/PasswordStrategyManager';

	interface PasswordValidationStrategy {
		message: string;
		validate(value: unknown): boolean | Promise<boolean>;
	}

	export const PasswordStrategyManager: PasswordStrategyManagerContract;
}
