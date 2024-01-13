import { Twilio as TwilioClient } from 'twilio';

export default class Twilio {
  private client: TwilioClient;
  private isFaked = false;
  
  constructor(private config: TwilioConfig) {
    this.config = config;
    this.client = new TwilioClient(
      config.sid, 
      config.authToken
    );
  }
  
  public fake() {
    this.isFaked = true;
  }
  
  public restore() {
    //
  }
  
	public sendMessage(to: string, body: string) {
		return this.client.messages.create({
			from: this.config.from,
			body,
			to
		});
	}

	public makeCall(to: string, twiml: string) {
		return this.client.calls.create({
			from: this.config.from,
			to,
			twiml,
		});
	}
}
