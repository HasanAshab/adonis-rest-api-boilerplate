import DB from "DB";
import User from "~/app/models/User";
import Category from "~/app/models/Category";
import Storage from "Storage";

describe("Category", () => {
  let admin;
  let token;
  
  beforeAll(async () => {
    await DB.connect();
  });
  
  beforeEach(async (config) => {
    Storage.mockClear();
    await DB.reset(["User", "Category"]);
    if(config.user !== false) {
      admin = await User.factory().withRole("admin").create();
      token = admin.createToken();
    }
  });
  
  it("Shouldn't accessable by general users", { user: false }, async () => {
    const user = await User.factory().create();
    const userToken = user.createToken();
    const requests = [
      request.get("/admin/categories"),
      request.post("/admin/categories"),
      request.get("/admin/categories/foo-user-id"),
      request.patch("/admin/categories/foo-user-id"),
      request.delete("/admin/categories/foo-user-id")
    ]
    const responses = await Promise.all(
      requests.map((request) => request.actingAs(userToken))
    );
    const isNotAccessable = responses.every(response => response.statusCode === 403);
    expect(isNotAccessable).toBe(true);
  });
  
  it("Should get all categories", async () => {
    const categories = await Category.factory().count(3).create();
    const response = await request.get("/api/v1/admin/categories").actingAs(token);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqualDocument(categories);
  });
  
  it("Should create category", async () => {
    const response = await request.post("/api/v1/admin/categories").actingAs(token).multipart({
      name: "foo bar",
      slug: "foo-bar",
      icon: fakeFile("image.png")
    });
    
    expect(response.statusCode).toBe(201);
    expect(await Category.findOne({ slug: "foo-bar" })).not.toBeNull();
    Storage.assertStoredCount(1);
    Storage.assertStored("image.png");
  });
  
  it("Should create category without icon", async () => {
    const response = await request.post("/api/v1/admin/categories").actingAs(token).multipart({
      name: "foo bar",
      slug: "foo-bar"
    });

    expect(response.statusCode).toBe(201);
    expect(await Category.findOne({ slug: "foo-bar" })).not.toBeNull();
    Storage.assertNothingStored();
  });

  it("Shouldn't create category with existing slug", async () => {
    const category = await Category.factory().create();
    const response = await request.post("/api/v1/admin/categories").actingAs(token).multipart({
      name: "foo bar",
      slug: category.slug,
    });
    expect(response.statusCode).toBe(400);
  });

  it.only("Should get category by id", async () => {
    const category = await Category.factory().create();
    const response = await request.get("/api/v1/admin/categories/" + category._id).actingAs(token);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqualDocument(category);
  });
  
  it("Should update category", async () => {
    let category = await Category.factory().create();
    const response = await request.patch("/api/v1/admin/categories/" + category._id).actingAs(token).multipart({
      name: "foo bar",
      slug: "foo-bar"
    });
    category = await Category.findById(category._id);
    expect(response.statusCode).toBe(200);
    expect(category.name).toBe("foo bar");
    expect(category.slug).toBe("foo-bar");
  });
  
  it("Should update category with icon", async () => {
    let category = await Category.factory().create();
    const response = await request.patch("/api/v1/admin/categories/" + category._id).actingAs(token).multipart({
      name: "foo bar",
      slug: "foo-bar",
      icon: fakeFile("image.png")
    });
    category = await Category.findById(category._id);
    expect(response.statusCode).toBe(200);
    expect(category.name).toBe("foo bar");
    expect(category.slug).toBe("foo-bar");
    Storage.assertStoredCount(1);
    Storage.assertStored("image.png");
  });
  
  it("Shouldn't update category with existing slug", async () => {
    let categories = await Category.factory().count(2).create();
    const response = await request.patch("/api/v1/admin/categories/" + categories[0]._id).actingAs(token).multipart({
      name: "foo bar",
      slug: categories[1].slug,
    });
    expect(response.statusCode).toBe(400);
  });

  it("Should delete category", async () => {
    const category = await Category.factory().create();
    const response = await request.delete("/api/v1/admin/categories/" + category._id).actingAs(token);
    expect(response.statusCode).toBe(204);
    expect(await Category.findById(category._id)).toBeNull();
  });
  
});
