import DB from "DB";
import User from "~/app/models/User";
import Storage from "Storage";
import Notification from "Notification";
import EmailVerificationNotification from "~/app/notifications/EmailVerificationNotification";

describe("user", () => {
  let user;
  let token;
  
  beforeAll(async ({ client, expect }) => {
    await DB.connect();
  });
  
  beforeEach(async (config) => {
    await DB.reset();
    Notification.mockClear();
    Storage.mockClear();
    if(config.user !== false) {
      user = await User.factory().create();
      token = user.createToken();
    }
  });
  
});
