/**
 * Contract source: https://git.io/Jfefs
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import type { InferListFromConfig } from '@adonisjs/core/build/config';
import type hashConfig from '../config/hash';
import BcryptNodeDriver from 'App/Providers/HashProvider/Drivers/BcryptNodeDriver';

declare module '@ioc:Adonis/Core/Hash' {
	interface BcryptNodeConfig {
		driver: 'bcrypt-node';
		rounds: number;
	}

	interface HashersList extends InferListFromConfig<typeof hashConfig> {
		'bcrypt-node': {
			config: BcryptNodeConfig;
			implementation: BcryptNodeDriver;
		};
	}
}
