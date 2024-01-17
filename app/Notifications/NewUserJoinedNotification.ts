import type { NotificationContract } from '@ioc:Verful/Notification'
import type User from '~/app/models/User';
import NewUserJoinedMail from '~/app/mails/NewUserJoinedMail';

export default class NewUserJoinedNotification implements NotificationContract {
  constructor(private user: User) {}

	via(notifiable: User) {
		return ['mail', 'database'] as const;
	}

	toMail(notifiable: User) {
		return new NewUserJoinedMail(notifiable, this.user);
	}

	toDatabase(notifiable: User) {
		return { user: this.user };
	}
}
