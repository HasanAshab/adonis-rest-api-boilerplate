import { UserDocument } from "~/app/models/User";
import Notification from "~/core/abstract/Notification";
import ForgotPasswordMail from "~/app/mails/ForgotPasswordMail";
import Token from "~/app/models/Token";
import URL from "URL";

export default class ForgotPasswordNotification extends Notification<UserDocument> {
  shouldQueue = true;

  via(notifiable: UserDocument){
    return ["email"];
  }
  
  async toEmail(notifiable: UserDocument) {
    const token = await this.createForgotPasswordToken(notifiable);
    const url = this.forgotPasswordUrl(notifiable, token);
    return new ForgotPasswordMail({ url });
  }
  
  async createForgotPasswordToken(notifiable: UserDocument) {
    const { secret } = await Token.create({
      key: notifiable._id,
      type: "resetPassword",
      expiresAt: Date.now() + 259200
    });
    return secret;
  }
  
  forgotPasswordUrl(notifiable: UserDocument, token: string) {
    return URL.client(`/password/reset/${notifiable._id}/${token}`);
  }
}