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

  it("Should post contact", { user: false }, async () => {
    const data = await Contact.factory().make();
    const response = await request.post("/api/v1/contact").send(data);

    expect(response.statusCode).toBe(201);
    expect(await Contact.findOne(data)).not.toBeNull();
  });
  
  it("Contact data should be sanitized", { user: false }, async () => {
    const data = {
      email: "foo@gmail.com",
      subject: "I'm trying XXS",
      message: "just a test, btw do u know i have a little experience of hacking??"
    };
    const script = "<script>alert('hacked')</script>";
    const response = await request.post("/api/v1/contact").send({
      email: data.email,
      subject: data.subject + script,
      message: data.message + script
    });
    expect(response.statusCode).toBe(201);
    console.log(await Contact.find())
    expect(await Contact.findOne(data)).not.toBeNull();
  });
  
  it("Contact management endpoints shouldn't be accessible by novice", { user: false }, async () => {
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
  
  it("Should get all contacts", async () => {
    const contacts = await Contact.factory().count(2).create();
    const response = await request.get("/api/v1/contact/inquiries").actingAs(token);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqualDocument(contacts);
  });
  
  it("Should get contact by id", async () => {
    const contact = await Contact.factory().create();
    const response = await request.get("/api/v1/contact/inquiries/" + contact._id).actingAs(token);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqualDocument(contact);
  });
  
  it("Should delete contact by id", async () => {
    const contact = await Contact.factory().create();
    const response = await request.delete("/api/v1/contact/inquiries/" + contact._id).actingAs(token);
    expect(response.statusCode).toBe(204);
    expect(await Contact.findById(contact._id)).toBeNull();
  });

  it("Should search contacts", async () => {
    const contact = await Contact.factory().create({ message });
    const response = await request.get("/api/v1/contact/inquiries/search").actingAs(token).query({
      q: "website bug",
    });
    console.log(response.body)
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqualDocument([contact]);
  });
  
  it("Should filter search contacts", async () => {
    const [openedContact] = await Promise.all([
      Contact.factory().create({ message }),
      Contact.factory().closed().create({ message })
    ]);
    const response = await request.get("/api/v1/contact/inquiries/search").actingAs(token).query({
      q: "website bug",
      status: "opened"
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqualDocument([openedContact]);
  });
  
  it("Should update contact status", async () => {
    let contact = await Contact.factory().create();
    const response = await request.patch(`/contact/inquiries/${contact._id}/status`).actingAs(token).send({ status: "closed" });
    contact = await Contact.findById(contact._id);
    expect(response.statusCode).toBe(200);
    expect(contact.status).toBe("closed");
  });

});
