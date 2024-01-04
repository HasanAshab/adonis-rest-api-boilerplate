import Env from '@ioc:Adonis/Core/Env';

export default {
	sid: Env.get('TWILIO_SID'),
	authToken: Env.get('TWILIO_AUTH_TOKEN'),
	from: '+15005550006',
};
