import { Schema, Document, QueryWithHelpers } from "mongoose";
import NotificationClass from "~/core/abstract/Notification";
import Notification from "Notification";
import NotificationModel, { NotificationDocument, NotificationQueryHelpers } from "~/app/models/Notification";

export interface NotifiableDocument<DocType extends NotifiableDocument<any> = any> extends Document {
  notifications: QueryWithHelpers<NotificationDocument[], NotificationDocument, NotificationQueryHelpers>;
  unreadNotifications: QueryWithHelpers<NotificationDocument[], NotificationDocument, NotificationQueryHelpers>;
  notify(notification: NotificationClass<DocType>): Promise<void>;
}

export default (schema: Schema) => {
  schema.virtual('notifications').get(function () {
    return NotificationModel.where("userId").equals(this._id);
  });

  schema.virtual('unreadNotifications').get(function () {
    return this.notifications.where("readAt").equals(null);
  });

  schema.methods.notify = async function(notification: NotificationClass<NotifiableDocument>) {
    await Notification.send(this as NotifiableDocument, notification);
  };
}