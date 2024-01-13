import { Twilio as TwilioClient } from 'twilio';
import expect from 'expect'

export default class Twilio {
  private client: TwilioClient;
  private isFaked = false;
  private faked: TwilioFakedData = {
    messages: [],
    calls: []
  };

  constructor(private config: TwilioConfig) {
    this.config = config;
    this.client = new TwilioClient(
      config.sid, 
      config.authToken
    );
  }
  
  public fake() {
    this.isFaked = true;
    this.restore();
  }
  
  public restore() {
    this.faked = {
      messages: [],
      calls: []
    }
  }
  
	public async sendMessage(to: string, body: string) {
		if(this.isFaked) {
		  return this.faked.messages.push(to);
		}
		
		await this.client.messages.create({
			from: this.config.from,
			body,
			to
		});
	}

	public async makeCall(to: string, twiml: string) {
		if(this.isFaked) {
		  return this.faked.calls.push(to);
		}
		
		await this.client.calls.create({
			from: this.config.from,
			to,
			twiml,
		});
	}

  
  public assertMessaged(phoneNumber: string) {
    expect(this.faked.messages.includes(phoneNumber)).toBe(true);
  }
  
  public assertCalled(phoneNumber: string) {
    expect(this.faked.calls.includes(phoneNumber)).toBe(true);
  }
}
