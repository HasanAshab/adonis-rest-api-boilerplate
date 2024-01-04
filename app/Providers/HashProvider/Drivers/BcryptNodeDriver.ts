import type {
	HashDriverContract,
	BcryptNodeConfig,
} from '@ioc:Adonis/Core/Hash';
import bcrypt from 'bcryptjs';

export default class BcryptNodeDriver implements HashDriverContract {
	constructor(private config: BcryptNodeConfig) {
		this.config = config;
	}

	public async make(value: string) {
		return await bcrypt.hash(value, this.config.rounds);
	}

	public async verify(hashedValue: string, plainValue: string) {
		return await bcrypt.compare(plainValue, hashedValue);
	}
}
