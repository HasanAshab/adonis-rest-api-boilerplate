import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import { inject } from '@adonisjs/fold';
import Config from '@ioc:Adonis/Core/Config';
import { Limiter } from '@adonisjs/limiter/build/services';
import type { Limiter as LimiterContract } from '@adonisjs/limiter/build/src/limiter';
import User from 'App/Models/User';
import Token from 'App/Models/Token';
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService';
import InvalidCredentialException from 'App/Exceptions/InvalidCredentialException';
import LoginAttemptLimitExceededException from 'App/Exceptions/LoginAttemptLimitExceededException';
import OtpRequiredException from 'App/Exceptions/OtpRequiredException';

export default class BasicAuthService {
	private loginThrottler?: LimiterContract;

	constructor(
		private readonly twoFactorAuthService = new TwoFactorAuthService(),
		private loginAttemptThrottlerConfig = Config.get(
			'auth.loginAttemptThrottler',
		),
	) {
		if (this.loginAttemptThrottlerConfig.enabled) {
			this.setupLoginThrottler();
		}
	}

	public async attempt(
		email: string,
		password: string,
		otp?: string,
		ip?: string,
	) {
		if (this.loginThrottler && !ip) {
			throw new Error(
				'Argument[3]: "ip" must be provided when login attempt throttle is enabled',
			);
		}

		const throttleKey = this.getThrottleKeyFor(email, ip);

		if (await this.loginThrottler?.isBlocked(throttleKey)) {
			throw new LoginAttemptLimitExceededException();
		}
    
		const user = await User.internals().where('email', email).preload('settings').first();
    
    console.log(user.attempt)
    
		if (!user) {
			throw new InvalidCredentialException();
		}

		if (!await user.comparePassword(password)) {
			await this.loginThrottler?.increment(throttleKey);
			throw new InvalidCredentialException();
		}

		await this.checkTwoFactorAuth(user, otp);
		await this.loginThrottler?.delete(throttleKey);

		return user;
	}

	public async forgotPassword(email: string) {
		const user = await User.internal().where('email').equals(email);
		if (!user) return false;
		await user.sendResetPasswordNotification();
		return true;
	}

	public async resetPassword(
		user: UserDocument,
		token: string,
		password: string,
	) {
		await Token.verify(user._id, 'resetPassword', token);
		user.password = password;
		await user.save();
	}

	private setupLoginThrottler() {
		const { maxFailedAttempts, duration, blockDuration } = this.loginAttemptThrottlerConfig;
		
		this.loginThrottler = Limiter.use({
			requests: maxFailedAttempts,
			duration: duration,
			blockDuration: blockDuration,
		});
	}

	private getThrottleKeyFor(email: string, ip: string) {
		return this.loginAttemptThrottlerConfig.key
			.replace('{{ email }}', email)
			.replace('{{ ip }}', ip);
	}

	private async checkTwoFactorAuth(user: User, otp?: string) {
	  if(!user.settings) {
	    await user.load('settings');
	  }

		const { enabled, method } = user.settings.twoFactorAuth;
		if (!enabled) return;

		if (!otp) {
			throw new OtpRequiredException();
		}

		await this.twoFactorAuthService.verifyOtp(user, method, otp);
	}
}
