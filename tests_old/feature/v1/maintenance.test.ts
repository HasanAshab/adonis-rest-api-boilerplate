import Config from "Config";

describe("App", () => {
  beforeAll(() => {
    Config.set({ app: { state: "down" } });
  });
  
  it("shouldn't accessable when in maintenance mode", async () => {
    const response = await request.get("/api/v1/");
    expect(response.statusCode).toBe(503);
  });
  
  it("shouldn't accessable with invalid bypass key when in maintenance mode", async () => {
    const response = await request.get("/api/v1/").query({ bypassKey: "foo-invalid-key" });
    expect(response.statusCode).toBe(503);
  });
  
  it("should accessable with valid bypass key when in maintenance mode", async () => {
    const response = await request.get("/api/v1/").query({ bypassKey: Config.get("app.key") });
    expect(response.statusCode).toBe(404);
  });
});
