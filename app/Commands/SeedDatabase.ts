import { Command } from "samer-artisan";
import mongoose from "mongoose";
import DB from "DB";
import DatabaseSeeder from "~/database/seeders/DatabaseSeeder";

export default class SeedDatabase extends Command {
  signature = "db:seed {--seeder=}";
  
  async handle() {
    let seeder;
    if(this.option("seeder")) {
      const { default: Seeder } = await import("~/database/seeders/" + this.option("seeder"));
      seeder = new Seeder();
    }
    else seeder = new DatabaseSeeder();
    await DB.connect();
    await seeder.run();
    this.info("Seeded successfully!");
  }
}
 