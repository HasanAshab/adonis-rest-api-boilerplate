import { AuthenticRequest, Response } from '~/core/express';

export default class EnsureEmailIsVerified {
	handle({ response, user }: HttpContextContract, next: NextFunction) {
		if (!user) {
			throw new Error(
				'You have to use "auth" middleware before using "verified" middleware.',
			);
		}

		if (user.verified) {
			return next();
		}

		res
			.status(403)
			.message('Your have to verify your email to perfom this action!');
	}
}
