import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { forIn } from 'lodash'

export default class EventProvider {
  constructor(protected app: ApplicationContract) {}
  
  private listen = {
    'registered': [
      'SendEmailVerificationNotification',
      'SendNewUserJoinedNotificationToAdmins'
    ]
  }
  
  
  public async boot() {
    this.subscribeListeners();
  }
  
  
  private subscribeListeners() {
    forIn(this.listen, (listeners, event) => {
      if(typeof listeners === 'string') {
        return this.subscribe(event, listeners);
      }
      listeners.forEach(listener => this.subscribe(event, listener));
    });
  }
  
  private subscribe(event: string, listener: string) {
    const Event = this.app.container.use('Adonis/Core/Event');

    if(!listener.includes('.')) {
      listener += '.dispatch';
    }
    console.log(listener)
    Event.on(event, listener);
  }
}
