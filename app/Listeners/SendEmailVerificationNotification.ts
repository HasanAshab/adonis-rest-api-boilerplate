import type { Listener, EventsList } from '@ioc:Adonis/Core/Event'
import { inject } from '@adonisjs/fold';

@inject()
export default class SendEmailVerificationNotification implements Listener<"registered"> {
  constructor(private readonly authService: BasicAuthService) {}
	
  async dispatch({ method, user, version }: EventsList["registered"]) {
    if(method === "internal") {
      await this.authService.sendVerificationMail(user, version);
    }
  }
}