import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer';
import User from 'App/Models/User';

export default class UserPolicy extends BasePolicy {
	delete(user: User, targetUser: User) {
		return (
			user._id.toString() === targetUser._id.toString() ||
			(user.role === 'admin' && targetUser.role !== 'admin')
		);
	}
}
