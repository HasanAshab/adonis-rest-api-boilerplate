import type { ApplicationContract } from '@ioc:Adonis/Core/Application';
import Config from '@ioc:Adonis/Core/Config';

export default class TwilioProvider {
	constructor(protected app: ApplicationContract) {}

	public register() {
		this.app.container.singleton('Adonis/Addons/Twilio', () => {
			const Twilio = require('./Twilio').default;
			return new Twilio(Config.get('twilio'));
		});
	}
}