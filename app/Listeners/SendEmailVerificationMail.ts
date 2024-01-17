import type { Listener, EventsList } from '@ioc:Adonis/Core/Event'
import BasicAuthService from 'App/Services/Auth/BasicAuthService';

export default class SendEmailVerificationMail implements Listener<"registered"> {
  constructor(private readonly authService = new BasicAuthService) {}
	
  async dispatch({ method, user, version }: EventsList["registered"]) {
    if(method === "internal") {
      await this.authService.sendVerificationMail(user, version);
    }
  }
}