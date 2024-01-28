import { Command } from "samer-artisan";
import DB from "DB";
import User from "~/app/models/User";

export default class CreateTestUser extends Command {
  signature = "create:user";
  description = "Creates a user for testing purpose";

  async handle(){
    await DB.connect();
    const user = await User.factory().create();
    await user.createDefaultSettings();
    
    const token = user.createToken();
    this.info("User data: ")
    console.log(user)
    this.info("Token: " + token);
  }
}