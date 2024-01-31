import DB from "~/core/utils/DB";
import Contact from "~/app/models/Contact";
import User from "~/app/models/User";


describe("Contact", () => {
  let admin;
  let token;
  let message = "I discovered a bug in your website";
  
  beforeAll(async () => {
    await DB.connect();
  });
  
  beforeEach(async (config) => {
    await DB.reset(["User", "Contact"]);
    if(config.user !== false) {
      admin = await User.factory().withRole("admin").create();
      token = admin.createToken();
    }
  });
 
  test("Should search contacts", async ({ client, expect }) => {
    const contact = await Contact.factory().create({ message });
    const response = await client.get("/api/v1/contact/inquiries/search").loginAs(user).query({
      q: "website bug",
    });
    console.log(response.body)
    response.assertStatus(200);
    expect(response.body.data).toEqualDocument([contact]);
  });
  
  test("Should filter search contacts", async ({ client, expect }) => {
    const [openedContact] = await Promise.all([
      Contact.factory().create({ message }),
      Contact.factory().closed().create({ message })
    ]);
    const response = await client.get("/api/v1/contact/inquiries/search").loginAs(user).query({
      q: "website bug",
      status: "opened"
    });
    response.assertStatus(200);
    expect(response.body.data).toEqualDocument([openedContact]);
  });
});
