import DB from "DB";
import User, { UserDocument } from "~/app/models/User";
import Notification from "~/app/models/Notification";
import NotificationFactory from 'Database/factories/NotificationFactory'
      await NotificationFactory.new().belongsTo(user).betweenLastYear().create()

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

  test("Should get notifications", async ({ client, expect }) => {
    const notifications = await Notification.factory().count(2).belongsTo(user).create();
    const response = await client.get("/api/v1/notifications").loginAs(user);
    response.assertStatus(200);
    expect(response.body.data).toEqualDocument(notifications);
  });
  test("Shouldn't get others notifications", async ({ client, expect }) => {
    const [notifications] = await Promise.all([
      Notification.factory().count(2).belongsTo(user).create(),
      Notification.factory().create()
    ]);
    const response = await client.get("/api/v1/notifications").loginAs(user);
    response.assertStatus(200);
    expect(response.body.data).toEqualDocument(notifications);
  });

  
  test("Should mark notification as read", async ({ client, expect }) => {
    let notification = await Notification.factory().unread().belongsTo(user).create();
    const response = await client.post("/api/v1/notifications/" + notification._id).loginAs(user);
    response.assertStatus(200);
    notification = await Notification.findById(notification._id);
    expect(notification.readAt).not.toBeNull();
  });
  test("Should mark all notifications as read", async ({ client, expect }) => {
    let notification = await Notification.factory().unread().belongsTo(user).create();
    const response = await client.post("/api/v1/notifications/" + notification._id).loginAs(user);
    response.assertStatus(200);
    notification = await Notification.findById(notification._id);
    expect(notification.readAt).not.toBeNull();
  });
  test("Shouldn't mark others notification as read", async ({ client, expect }) => {
    let notification = await Notification.factory().unread().create();
    const response = await client.post("/api/v1/notifications/"+ notification._id).loginAs(user);
    response.assertStatus(404);
    notification = await Notification.findById(notification._id)
    expect(notification.readAt).toBeNull();
  });
  

  test("Should get unread notifications count", async ({ client, expect }) => {
    await Promise.all([
      Notification.factory().count(2).unread().belongsTo(user).create(),
      Notification.factory().create({userId: user._id})
    ]);
    const response = await client.get("/api/v1/notifications/unread-count").loginAs(user);
    response.assertStatus(200);
    expect(response.body.data.count).toBe(2);
  });
  
  
  test("Should delete notification", async ({ client, expect }) => {
    let notification = await Notification.factory().belongsTo(user).create();
    const response = await client.delete(`/notifications/${notification._id}`).loginAs(user);
    response.assertStatus(204);
    notification = await Notification.findById(notification._id);
    expect(notification).toBeNull();
  });
  test("Shouldn't delete others notification", async ({ client, expect }) => {
    let notification = await Notification.factory().create();
    const response = await client.delete(`/notifications/${notification._id}`).loginAs(user);
    response.assertStatus(404);
    notification = await Notification.findById(notification._id);
    expect(notification).not.toBeNull();
  });
});
