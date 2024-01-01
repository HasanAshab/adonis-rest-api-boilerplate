import { UserDocument } from "~/app/models/User";
import Notification from "~/core/abstract/Notification";
import Token from "~/app/models/Token";
import EmailVerificationMail from "~/app/mails/EmailVerificationMail";
import URL from "URL";

export default class EmailVerificationNotification extends Notification<UserDocument> {
  shouldQueue = true;

  async via(notifiable: UserDocument){
    return ["email"];
  }
  
  async toEmail(notifiable: UserDocument) {
    const token = await this.createVerificationToken(notifiable);
    const link = this.verificationUrl(notifiable, token);
    return new EmailVerificationMail({ link })
  }
  
  verificationUrl(notifiable: UserDocument, token: string) {
    return URL.route(this.data.version + "_verify", { id: notifiable._id, token });
  }
  
  async createVerificationToken(notifiable: UserDocument) {
    const { secret } = await Token.create({
      key: notifiable._id,
      type: "verifyEmail",
      expiresAt: Date.now() + 259200
    });
    return secret;
  }
}