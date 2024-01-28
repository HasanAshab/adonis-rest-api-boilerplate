import DB from "DB";
import Config from "Config";
import User, { UserDocument } from "~/app/models/User";
import Settings from "~/app/models/Settings";

describe("Settings", () => {
  let user: UserDocument;
  let token: string;

  beforeAll(async () => {
    await DB.connect();
  });
  
  beforeEach(async (config) => {
    await DB.reset(["User"]);
    if(config.user !== false) {
      factory = User.factory().withRole(config.role ?? "novice");
      if(config.settings !== false)
        factory.hasSettings(config.mfa);
      if(config.phone)
        factory.withPhoneNumber();
      
      user = await factory.create();
      token = user.createToken();
    }
  });
  
  it("App settings shouldn't accessable by novice users", { settings: false }, async () => {
    const requests = [
      request.get("/settings/app"),
      request.patch("/settings/app"),
    ];
    const responses = await Promise.all(
      requests.map((request) => request.actingAs(token))
    );
    const isNotAccessable = responses.every((response) => response.statusCode === 403);
    expect(isNotAccessable).toBe(true);
  });
  
  it("Admin should get app settings", { role: "admin", settings: false }, async () => {
    const response = await request.get("/api/v1/settings/app").actingAs(token);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(config);
  });

  it("Admin should update app settings", { role: "admin", settings: false }, async () => {
    const response = await request.patch("/api/v1/settings/app").actingAs(token).send({
      app: { name: "FooBar" }
    });
    expect(response.statusCode).toBe(200);
    expect(Config.get("app.name")).toBe("FooBar");
  });
  
  it("Should get settings", async () => {
    const response = await request.get("/api/v1/settings").actingAs(token);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqualDocument(await user.settings);
  });
  
  it("Should enable Two Factor Authorization", { phone: true }, async () => {
    const response = await request.post("/api/v1/settings/setup-2fa").actingAs(token).send({ enable: true });
    const settings = await user.settings;
    expect(response.statusCode).toBe(200);
    expect(response.body.data.recoveryCodes).toHaveLength(10);
    expect(settings.twoFactorAuth.enabled).toBe(true);
    expect(settings.twoFactorAuth.method).toBe("sms");
  });
  
  it("Should disable Two Factor Authorization", { mfa: true, phone: true }, async () => {
    const response = await request.post("/api/v1/settings/setup-2fa").actingAs(token).send({ enable: false });
    const settings = await user.settings;
    expect(response.statusCode).toBe(200);
    expect(settings.twoFactorAuth.enabled).toBe(false);
  });
  
  it("Two Factor Authorization should flag for phone number if not setted", async () => {
    const response = await request.post("/api/v1/settings/setup-2fa").actingAs(token).send({ enable: true });
    const settings = await user.settings;
    expect(response.statusCode).toBe(400);
    expect(response.body.data.phoneNumberRequired).toBe(true);
    expect(settings.twoFactorAuth.enabled).toBe(false);
  });
  
  it("Two Factor Authorization app method sends OTP Auth URL", async () => {
    const response = await request.post("/api/v1/settings/setup-2fa").actingAs(token).send({ enable: true, method: "app" });
    const settings = await user.settings;
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty("otpauthURL");
    expect(response.body.data.recoveryCodes).toHaveLength(10);
    expect(settings.twoFactorAuth.enabled).toBe(true);
  });

  
  it("Should change Two Factor Authorization method", { mfa: true, phone: true }, async () => {
    const response = await request.post("/api/v1/settings/setup-2fa").actingAs(token).send({ method: "call" });
    const settings = await user.settings;
    expect(response.statusCode).toBe(200);
    expect(response.body.data.recoveryCodes).toHaveLength(10);
    expect(settings.twoFactorAuth.method).toBe("call");
  });


  it.only("Should update notification settings", async () => {
    const data = {
      announcement: {
        email: false
      },
      feature: {
        email: false,
        site: false
      },
      others: {
        site: false
      }
    };
    const response = await request.patch("/api/v1/settings/notification").actingAs(token).send(data);
    const settings = await user.settings;
    console.log(settings)
    expect(response.statusCode).toBe(200);
    for(key1 in data){
      for(key2 in data[key1]){
        expect(data[key1][key2]).toBe(settings.notification[key1][key2]);
      }
    }
  });
  
});
