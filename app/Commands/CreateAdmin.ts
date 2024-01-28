import { Command } from "samer-artisan";
import DB from "DB";
import User from "~/app/models/User";
import Settings from "~/app/models/Settings";


export default class MakeAdmin extends Command {
  signature = "create:admin {name?} {username} {email} {password}";
  
  async handle() {
    await DB.connect();
    const admin = await User.create({
      ...this.arguments(),
      role: "admin",
      verified: true,
    });
    await admin.createDefaultSettings();
    this.info("Admin account created successfully!");
  }
}