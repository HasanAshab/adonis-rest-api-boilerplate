import { forIn } from 'lodash-es'
import { ApplicationService } from "@adonisjs/core/types";

export default class EventProvider {
  constructor(protected app: ApplicationService) {}

  private listen = {
    registered: [
      'SendEmailVerificationMail',
      'SendNewUserJoinedNotificationToAdmins'
    ],
  }

  public async boot() {
    this.subscribeListeners()
  }

  private subscribeListeners() {
    forIn(this.listen, (listeners, event) => {
      if (typeof listeners === 'string') {
        return this.subscribe(event, listeners)
      }
      listeners.forEach((listener) => this.subscribe(event, listener))
    })
  }

  private subscribe(event: string, listener: string) {
    const event = this.app.container.use('event')

    if (!listener.includes('.')) {
      listener += '.dispatch'
    }

    event.on(event, listener)
  }
}
