export type CacheData = string | number | boolean | CacheData[] | Record<string, CacheData>;
export type Resolver = () => CacheData | Promise<CacheData>;

export default abstract class CacheDriver {
  abstract get(key: string, deserialize?: boolean): Promise<CacheData | null>;
  abstract put<T extends CacheData, U extends boolean>(key: string, data: T, expiry?: number, returnSerialized?: U): Promise<U extends true ? string : T>;
  abstract delete(key: string): Promise<void>;
  abstract flush(): Promise<void>;
  
  async increment(key: string, value = 1) {
    const data = await this.get(key) ?? 0;
    const incremented = parseInt(data) + value;
    await this.put(key, incremented);
    return incremented;
  }
  
  async decrement(key: string, value = 1) {
    return await this.increment(key, value * -1);
  }
  
  async remember(key: string, expiry: number, resolver: Resolver) {
    return await this.get(key) ?? 
      await this.put(key, await resolver(), expiry);
  }
  
  async rememberSerialized(key: string, expiry: number, resolver: Resolver) {
    return await this.get(key, false) ?? 
      await this.put(key, await resolver(), expiry, true);
  }
  
  async rememberForever(key: string, resolver: Resolver) {
    return await this.get(key) ?? 
      await this.put(key, await resolver());
  }
  
  async rememberSerializedForever(key: string, resolver: Resolver) {
    return await this.get(key, false) ?? 
      await this.put(key, await resolver(), undefined, true);
  }
  

  protected serialize(data: CacheData) {
    return typeof data !== "string"
      ? JSON.stringify(data)
      : data;
  }
  
  protected deserialize(data: CacheData) {
    return data && typeof data === "string"
      ? JSON.parse(data)
      : data;
  }
}