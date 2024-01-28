import { Command } from "samer-artisan";
import mongoose from "mongoose";
import DB from "DB";
import DatabaseSeeder from "~/database/seeders/DatabaseSeeder";

export default class CountDatabase extends Command {
  signature = "db:count";
  
  private total = 0;
  
  async handle() {
    await DB.connect();
    const modelsName = mongoose.modelNames();
    this.info("Counting documents...\n");
    const countPromises = modelsName.map(name => this.countModel(name));
    await Promise.all(countPromises);
    this.info(`Total: ${this.total}`);
  }
  
  private async countModel(modelName: string) {
    const Model = mongoose.model(modelName);
    const documentCount = await Model.count();
    this.total += documentCount;
    this.info(`${Model.modelName}:\t${documentCount}`)
  }
}
 