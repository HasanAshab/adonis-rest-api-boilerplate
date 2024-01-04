import type { ApplicationContract } from '@ioc:Adonis/Core/Application';
import type { HashContract } from '@ioc:Adonis/Core/Hash';
import Config from '@ioc:Adonis/Core/Config';

export default class HashProvider {
	private Hash!: HashContract;

	constructor(protected app: ApplicationContract) {}

	private registerBcryptNodeDriver() {
		this.Hash.extend('bcrypt-node', () => {
			const BcryptNodeDriver = require('./Drivers/BcryptNodeDriver').default;
			const config = Config.get('hash.list.bcrypt-node');
			return new BcryptNodeDriver(config);
		});
	}

	public boot() {
		this.Hash = this.app.container.use('Adonis/Core/Hash');
		this.registerBcryptNodeDriver();
	}
}
