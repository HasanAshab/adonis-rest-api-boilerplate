import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User, { UserDocument } from "App/Models/User";

export default class UserPolicy extends BasePolicy {
  delete(user: UserDocument, targetUser: UserDocument){
    return user._id.toString() === targetUser._id.toString() ||
      (user.role === "admin" && targetUser.role !== "admin");
  }
}
