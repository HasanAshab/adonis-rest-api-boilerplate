import type { NotificationContract } from '@ioc:Verful/Notification'
import { interpolate } from '@ioc:Adonis/Core/Helpers';
import type User from 'App/Models/User';
import ResetPasswordMail from "App/Mails/ResetPasswordMail";

export default class ResetPasswordNotification implements NotificationContract {
  constructor(private token: string, private redirectUrl: string) {}
  
  public via(notifiable: User) {
    return 'mail' as const;
  }
  
  public toMail(notifiable: UserDocument) {
		const url = this.forgotPasswordClientUrl(notifiable);
		return new ResetPasswordMail(notifiable, url);
	}


	public forgotPasswordClientUrl(notifiable: UserDocument, token: string) {
		return interpolate(this.redirectUrl, {
		  id: notifiable.id,
		  token: this.token
		});
	}
}
