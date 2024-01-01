import { UserDocument } from "~/app/models/User";
import Notification from "~/core/abstract/Notification";
import NewUserJoinedMail from "~/app/mails/NewUserJoinedMail";

export default class NewUserJoinedNotification extends Notification<UserDocument> {
  shouldQueue = true;

  via(notifiable: UserDocument){
    return ["site", "email"];
  }
  
  toEmail(notifiable: UserDocument) {
    return new NewUserJoinedMail({ user: this.data.user });
  }
  
  toSite(notifiable: UserDocument) {
    return { user: this.data.user }
  }
}