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

  test("Should post contact", { user: false }, async ({ client, expect }) => {
    const data = await Contact.factory().make();
    const response = await client.post("/api/v1/contact").send(data);

    response.assertStatus(201);
    expect(await Contact.findOne(data)).not.toBeNull();
  });
  
  test("Contact data should be sanitized", { user: false }, async ({ client, expect }) => {
    const data = {
      email: "foo@gmail.com",
      subject: "I'm trying XXS",
      message: "just a test, btw do u know i have a little experience of hacking??"
    };
    const script = "<script>alert('hacked')</script>";
    const response = await client.post("/api/v1/contact").json({
      email: data.email,
      subject: data.subject + script,
      message: data.message + script
    });
    response.assertStatus(201);
    console.log(await Contact.find())
    expect(await Contact.findOne(data)).not.toBeNull();
  });
  
  test("Contact management endpoints shouldn't be accessible by novice", { user: false }, async ({ client, expect }) => {
    const user = await User.factory().create();
    const userToken = user.createToken();
    const requests = [
      request.get("/contact/inquiries"),
      request.get("/contact/inquiries/fooId"),
      request.delete("/contact/inquiries/fooId"),
      request.patch("/contact/inquiries/fooId/status"),
      request.get("/contact/inquiries/search"),
    ];
  
    const responses = await Promise.all(
      requests.map(request => request.actingAs(userToken))
    );
  
    const isNotAccessable = responses.every(response => response.statusCode === 403);
    expect(isNotAccessable).toBe(true);
  });
  
  test("Should get all contacts", async ({ client, expect }) => {
    const contacts = await Contact.factory().count(2).create();
    const response = await client.get("/api/v1/contact/inquiries").loginAs(user);
    response.assertStatus(200);
    expect(response.body.data).toEqualDocument(contacts);
  });
  
  test("Should get contact by id", async ({ client, expect }) => {
    const contact = await Contact.factory().create();
    const response = await client.get("/api/v1/contact/inquiries/" + contact._id).loginAs(user);
    response.assertStatus(200);
    expect(response.body.data).toEqualDocument(contact);
  });
  
  test("Should delete contact by id", async ({ client, expect }) => {
    const contact = await Contact.factory().create();
    const response = await client.delete("/api/v1/contact/inquiries/" + contact._id).loginAs(user);
    response.assertStatus(204);
    expect(await Contact.findById(contact._id)).toBeNull();
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
  
  test("Should update contact status", async ({ client, expect }) => {
    let contact = await Contact.factory().create();
    const response = await client.patch(`/contact/inquiries/${contact._id}/status`).loginAs(user).json({ status: "closed" });
    contact = await Contact.findById(contact._id);
    response.assertStatus(200);
    expect(contact.status).toBe("closed");
  });

});
