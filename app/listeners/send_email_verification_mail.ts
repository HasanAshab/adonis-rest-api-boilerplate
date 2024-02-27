import BasicAuthService from '#app/services/auth/basic_auth_service'
import { Listener } from "@adonisjs/core/events";
import { EventsList } from "@adonisjs/core/events";

export default class SendEmailVerificationMail implements Listener<'registered'> {
  constructor(private readonly authService = new BasicAuthService()) {}

  async dispatch({ user }: EventsList['registered']) {
    await this.authService.sendVerificationMail(user)
  }
}
