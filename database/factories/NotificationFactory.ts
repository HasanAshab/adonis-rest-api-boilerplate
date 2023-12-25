import Factory from "~/core/database/Factory";
import User, { UserDocument } from "~/app/models/User";
import type { INotification, NotificationDocument } from "~/app/models/Notification";

export default class NotificationFactory extends Factory<INotification, NotificationDocument> {
  definition() {
    return {
      userId: new User()._id,
      type: "TestNotification",
      data: { text: this.faker.lorem.words(5) },
      readAt: new Date()
    };
  };
  
  unread() {
    return this.state((notification: any) => {
      notification.readAt = null;
      return notification;
    });
  }
  
  belongsTo(user: UserDocument) {
    return this.state((notification: INotification) => {
      notification.userId = user._id;
      return notification;
    });
  }

}