import Factory from 'App/Models/Traits/HasFactory/Factory';
import Settings from 'App/Models/Settings';

export default class UserFactory extends Factory {
	definition() {
		return {
			name: this.faker.person.firstName(),
			username: this.faker.person.firstName(),
			email: this.faker.internet.email(),
			phoneNumber: null,
			password: 'password',
			verified: true,
			role: 'novice' as const,
			profile: null,
			recoveryCodes: [],
			socialId: {},
		};
	}

	unverified() {
		return this.state((user: IUser) => {
			user.verified = false;
			return user;
		});
	}

	social(provider = 'google', id = '100020') {
		return this.state((user: IUser) => {
			user.password = null;
			user.socialId[provider] = id;
			return user;
		});
	}

	withRole(name: IUser['role']) {
		return this.state((user: IUser) => {
			user.role = name;
			return user;
		});
	}

	hasSettings(enableTwoFactorAuth = false) {
		return this.external((user: User) => {
		  return user.related('settings').create({ 
		    twoFactorAuth: { enabled: enableTwoFactorAuth }
		  });
		});
	}

	withProfile(url = this.faker.internet.avatar()) {
		return this.state((user: IUser) => {
			user.profile = url;
			return user;
		});
	}

	withPhoneNumber(phoneNumber = '+15005550006') {
		return this.state((user: IUser) => {
			user.phoneNumber = phoneNumber;
			return user;
		});
	}
}
