import DB from "DB";
import User, { UserDocument } from "~/app/models/User";
import Notification from "~/app/models/Notification";

describe("Notification", () => {
  let user: UserDocument;
  let token: string;

  beforeAll(async () => {
    await DB.connect();
  });
  
  beforeEach(async () => {
    await DB.reset(["User", "Notification"]);
    user = await User.factory().create();
    token = user.createToken();
  });

  it("Should get notifications", async () => {
    const notifications = await Notification.factory().count(2).belongsTo(user).create();
    const response = await request.get("/api/v1/notifications").actingAs(token);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqualDocument(notifications);
  });
  
  it("Should mark notification as read", async () => {
    let notification = await Notification.factory().unread().belongsTo(user).create();
    const response = await request.post("/api/v1/notifications/" + notification._id).actingAs(token);
    expect(response.statusCode).toBe(200);
    notification = await Notification.findById(notification._id);
    expect(notification.readAt).not.toBeNull();
  });
  
  it("Shouldn't mark others notification as read", async () => {
    let notification = await Notification.factory().unread().create();
    const response = await request.post("/api/v1/notifications/"+ notification._id).actingAs(token);
    expect(response.statusCode).toBe(404);
    notification = await Notification.findById(notification._id)
    expect(notification.readAt).toBeNull();
  });
  
  it("Shouldn't get others notifications", async () => {
    const [notifications] = await Promise.all([
      Notification.factory().count(2).belongsTo(user).create(),
      Notification.factory().create()
    ]);
    const response = await request.get("/api/v1/notifications").actingAs(token);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqualDocument(notifications);
  });
  
  it("Should get unread notifications count", async () => {
    await Promise.all([
      Notification.factory().count(2).unread().belongsTo(user).create(),
      Notification.factory().create({userId: user._id})
    ]);
    const response = await request.get("/api/v1/notifications/unread-count").actingAs(token);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.count).toBe(2);
  });
  
  it("Should delete notification", async () => {
    let notification = await Notification.factory().belongsTo(user).create();
    const response = await request.delete(`/notifications/${notification._id}`).actingAs(token);
    expect(response.statusCode).toBe(204);
    notification = await Notification.findById(notification._id);
    expect(notification).toBeNull();
  });
  
  it("Shouldn't delete others notification", async () => {
    let notification = await Notification.factory().create();
    const response = await request.delete(`/notifications/${notification._id}`).actingAs(token);
    expect(response.statusCode).toBe(404);
    notification = await Notification.findById(notification._id);
    expect(notification).not.toBeNull();
  });
});
