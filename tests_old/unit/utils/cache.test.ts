import Cache from "Cache";
import Config from "Config";

describe("Cache", () => {
  const drivers = ["redis", "memory"];
  
  beforeEach(async () => {
    for(const driverName of drivers){
      await Cache.driver(driverName).delete("key");
    }
  });
  
  
  test("Should cache with default driver", async ({ client, expect }) => {
    await Cache.put("key", "data");
    expect(await Cache.driver("memory").get("key")).toBe("data");
    expect(await Cache.driver("redis").get("key")).toBeNull();
  });
  
  test("Should reset to default driver", async ({ client, expect }) => {
    await Cache.driver("redis").put("key", "data");
    await Cache.put("key2", "data2");
    expect(await Cache.driver("memory").get("key2")).toBe("data2");
  });
  
  test("Should cache", async ({ client, expect }) => {
    for(const driverName of drivers){
      await Cache.driver(driverName).put("key", "data")
      expect(await Cache.driver(driverName).get("key")).toBe("data");
    }
  });
  
  test("Should delete cache", async ({ client, expect }) => {
    for(const driverName of drivers){
      await Cache.driver(driverName).put("key", "data")
      await Cache.driver(driverName).delete("key")
      expect(await Cache.driver(driverName).get("key")).toBe(null);
    }
  });
  
  test("Should driver cache with expiry time", async ({ client, expect }) => {
    for(const driverName of drivers){
      await Cache.driver(driverName).put("key", "data", 10)
      expect(await Cache.driver(driverName).get("key")).toBe("data");
    }
  });
  
  test("Shouldn't get expired cache", async ({ client, expect }) => {
    for(const driverName of drivers){
      await Cache.driver(driverName).put("key", "data", 1)
    }
    await sleep(1002);
    for(const driverName of drivers){
      expect(await Cache.driver(driverName).get("key")).toBe(null);
    }
  });
  
  test("Should remember cache", async ({ client, expect }) => {
    for(const driverName of drivers) {
      Cache.driver(driverName).put("key", "data")
      const value = Cache.driver(driverName).remember("key", 1000, () => {});
      expect(value).toBe("data");
    }
  });
});
