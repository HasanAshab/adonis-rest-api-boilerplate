import type { Listener, EventsList } from '@ioc:Adonis/Core/Event'

export default class SendEmailVerificationNotification implements Listener<"registered"> {
  async dispatch(event: EventsList["registered"]) {
    if(event.method === "internal") {
      await event.user.sendVerificationNotification(event.version);
    }
  }
}