import Factory from 'App/Models/Traits/HasFactory/Factory';
import User from 'App/Models/User';

export default class UserFactory extends Factory<User> {
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
		return this.state(user => {
			user.verified = false;
			return user;
		});
	}

	social(provider = 'google', id = '100020') {
		return this.state(user => {
			user.password = null;
			user.socialId[provider] = id;
			return user;
		});
	}

	withRole(name: User['role']) {
		return this.state(user => {
			user.role = name;
			return user;
		});
	}

	withProfile(url = this.faker.internet.avatar()) {
		return this.state(user => {
			user.profile = url;
			return user;
		});
	}

	withPhoneNumber(phoneNumber = '+15005550006') {
		return this.state(user => {
			user.phoneNumber = phoneNumber;
			return user;
		});
	}
	
	hasSettings(enableTwoFactorAuth = false) {
		return this.external((user: User) => {
		  return user.related('settings').create({ 
		    twoFactorAuth: { 
		      enabled: enableTwoFactorAuth,
		      method: 'sms',
		      secret: null
		    }
		  });
		});
	}

}
