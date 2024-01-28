import { Command } from "samer-artisan";
import { model } from "mongoose";
import DB from "DB";
import DatabaseSeeder from "~/database/seeders/DatabaseSeeder";
import { HasFactoryModel } from "~/app/plugins/HasFactory";

interface Arguments {
  modelName: string;
  count: string;
}

export default class FactorySeedDatabase extends Command<Arguments> {
  signature = "db:seedFactory {modelName} {count}";

  async handle() {
    await DB.connect();
    const { modelName, count } = this.arguments();
    const Model = model<any, HasFactoryModel>(modelName);
    await Model.factory().count(parseInt(count)).create();
    this.info("Seeded successfully!");
  }
}