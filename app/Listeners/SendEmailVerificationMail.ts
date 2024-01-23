import type { Listener, EventsList } from '@ioc:Adonis/Core/Event'
import BasicAuthService from 'App/Services/Auth/BasicAuthService';

export default class SendEmailVerificationMail implements Listener<"registered"> {
  constructor(private readonly authService = new BasicAuthService) {}
	
  async dispatch({ user, version }: EventsList["registered"]) {
    await this.authService.sendVerificationMail(user, version);
  }
}