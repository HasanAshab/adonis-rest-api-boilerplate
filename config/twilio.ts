import { TwilioConfig } from '@ioc:Adonis/Addons/Twilio';
import Env from '@ioc:Adonis/Core/Env';

const twilioConfig: TwilioConfig = {
	sid: Env.get('TWILIO_SID'),
	authToken: Env.get('TWILIO_AUTH_TOKEN'),
	from: '+15005550006',
};

export default twilioConfig;