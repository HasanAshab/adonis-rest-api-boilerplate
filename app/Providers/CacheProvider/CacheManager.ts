import Manager from './Manager';
import type { CacheData, Resolver } from './CacheDriver';
import Config from '@ioc:Adonis/Core/Config';

export default class CacheManager extends Manager {
	defaultDriver() {
		return Config.get<string>('cache.default');
	}

	protected createMemoryDriver() {
		const MemoryDriver = require('./drivers/MemoryDriver').default;
		return new MemoryDriver();
	}

	protected createRedisDriver() {
		const RedisDriver = require('./drivers/RedisDriver').default;
		return new RedisDriver();
	}
}
