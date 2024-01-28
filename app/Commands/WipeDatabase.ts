import { Command } from "samer-artisan";
import { model } from "mongoose";
import DB from "DB";
import DatabaseSeeder from "~/database/seeders/DatabaseSeeder";

export default class WipeDatabase extends Command<{}, { model: string | null }> {
  signature = "db:wipe {--model=}";
  
  async handle() {
    const modelName = this.option("model");
    await DB.connect();
    if(modelName) {
      this.info(`Clearing ${modelName} Model...`)
      const Model = model(modelName);
      await Model.deleteMany({});
    }
    else await DB.reset();
    this.info("Done!");
  }
}
 