import DB from "DB";
import User, { UserDocument } from "~/app/models/User";

describe("Dashboard", () => {
  let admin: UserDocument;
  let token: string;
  
  beforeAll(async () => {
    await DB.connect();
  });
  
  beforeEach(async (config) => {
    await DB.reset(["User"]);
    if(config.user !== false) {
      admin = await User.factory().withRole("admin").create()
      token = admin.createToken();
    }
  });
  
  test("Novice users shouldn't get admin dashboard", { user: false }, async ({ client, expect }) => {
    const user = await User.factory().create();
    const response = await client.get("/api/v1/admin/dashboard").actingAs(user.createToken());
    response.assertStatus(403);
  });
  
  test("Admin should get dashboard", async ({ client, expect }) => {
    const [todayUser, oldUser] = await Promise.all([
      User.factory().count(2).create(),
      User.factory().count(3).create({ createdAt: new Date(2022, 0, 1) })
    ]);
    const response = await client.get("/api/v1/admin/dashboard").loginAs(user);
    response.assertStatus(200);
    expect(response.body.data.totalUsers).toBe(5);
    expect(response.body.data.newUsersToday).toBe(2);
  });
});
