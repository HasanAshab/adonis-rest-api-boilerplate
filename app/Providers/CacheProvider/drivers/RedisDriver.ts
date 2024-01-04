import CacheDriver, { CacheData } from '../CacheDriver';
import Redis from '@ioc:Adonis/Addons/Redis';

export default class RedisDriver extends CacheDriver {
	async get(key: string, deserialize = true) {
		let data = await Redis.get(key);

		if (deserialize) {
			data = this.deserialize(data);
		}

		return data;
	}

	async put<T extends CacheData, U extends boolean>(
		key: string,
		data: T,
		expiry?: number,
		returnSerialized?: U,
	): Promise<U extends true ? string : T> {
		const serializedData = this.serialize(data);
		if (expiry) {
			await Redis.set(key, serializedData, 'EX', expiry);
		} else {
			await Redis.set(key, serializedData);
		}

		return returnSerialized ? serializedData : data;
	}

	async delete(key: string) {
		await Redis.del(key);
	}

	async increment(key: string, value = 1) {
		return await Redis.incr(key, value);
	}

	async decrement(key: string, value = 1) {
		return await Redis.decr(key, value);
	}

	async flush() {
		await Redis.flushall();
	}
}
