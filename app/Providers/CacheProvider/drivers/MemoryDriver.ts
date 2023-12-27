import CacheDriver, { CacheData } from "../CacheDriver";
import memoryCache from "memory-cache";

export default class MemoryDriver extends CacheDriver {
  async get(key: string, deserialize = true) {
    let data = memoryCache.get(key);

    if(deserialize) {
      data = this.deserialize(data);
    }
    
    return data;
  }
  
  async put<T extends CacheData>(key: string, data: T, expiryInSeconds?: number, returnSerialized = false) {
    const serializedData = this.serialize(data);
    const expiryInMilliseconds = expiryInSeconds ? expiryInSeconds * 1000 : undefined;

    memoryCache.put(key, serializedData, expiryInMilliseconds);
    
    return returnSerialized ? serializedData : data;
  }
  
  async delete(key: string){
    memoryCache.del(key);
  }
  
  async flush(){
    memoryCache.clear();
  }
}