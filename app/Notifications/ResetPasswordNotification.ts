import type { NotificationContract } from '@ioc:Verful/Notification'
import { interpolate } from '@ioc:Adonis/Core/Helpers';
import type User from 'App/Models/User';
import ForgotPasswordMail from "App/Mails/ForgotPasswordMail";
import Token from 'App/Models/Token';

export default class ResetPasswordNotification implements NotificationContract {
  constructor(private token: string, private redirectUrl: string) {
    this.token = token;
    this.redirectUrl = redirectUrl;
  }
  
  public via(notifiable: User) {
    return 'mail' as const
  }
  
  public toMail(notifiable: UserDocument) {
		const url = this.forgotPasswordClientUrl(notifiable);
		console.log(url)
		return new ForgotPasswordMail(notifiable, url);
	}


	public forgotPasswordClientUrl(notifiable: UserDocument, token: string) {
		return interpolate(this.redirectUrl, {
		  id: notifiable.id,
		  token: this.token
		});
	}
}
