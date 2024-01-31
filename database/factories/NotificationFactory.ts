import Factory from 'App/Models/Traits/HasFactory/Factory';
import User from 'App/Models/User';
import createNotificationModel from '@verful/notifications/build/src/Models/DatabaseNotification'
import { DateTime } from 'luxon';


export default class NotificationFactory extends Factory {
  static Model = createNotificationModel('notifications');
  
	definition() {
		return {
			notifiableId: 1,
			data: { text: this.faker.lorem.words(5) },
			readAt: DateTime.local(),
		};
	}

	unread() {
		return this.state(notification => {
			//delete notification.readAt;
			notification.readAt = null;
			return notification;
		});
	}
	
	betweenLastYear() {
		return this.state(notification => {
			notification.createdAt = DateTime.fromJSDate(this.faker.date.past());
			return notification;
		});
	}

	belongsTo(user: User) {
		return this.state(notification => {
			notification.notifiableId = user.id;
			return notification;
		});
	}
}

