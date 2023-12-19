import type { ApplicationContract } from '@ioc:Adonis/Core/Application';
import Logger from '@ioc:Adonis/Core/Logger';
import Config from '@ioc:Adonis/Core/Config';
import mongoose from "mongoose";
import { readdir } from "fs/promises";
import Helpers from "./Plugins/Helpers";
//import Assertable from "./Plugins/Assertable";
import Paginate from "./Plugins/Paginate";
import Transform from "./Plugins/Transform";
import Hidden from "./Plugins/Hidden";
//import Testable from "./Plugins/Testable";

export default class MongoProvider {
  constructor(protected app: ApplicationContract) {
    this.app = app;
  }

  async register() {
    mongoose.set('strictQuery', true);
    this.registerGlobalPlugins();
    Config.get("mongoose.loadModels") && await this.discoverModels();
  }

  async boot() {
    const { connect, syncIndexes } = Config.get("mongoose");
    connect && await this.connect();
    syncIndexes && await mongoose.syncIndexes();
  }

  private async connect() {
    try {
      await mongoose.connect(Config.get("mongoose.url"), Config.get("mongoose.options"));
      Logger.info("Connected to database [MONGOOSE]");
    }
    catch(err) {
      Logger.error("Could not connect to database. reason\n, %o", err.stack);
    }
  }
  
  private registerGlobalPlugins() {
    mongoose.plugin(Helpers);
   // mongoose.plugin(Assertable);
    mongoose.plugin(Paginate);
    mongoose.plugin(Transform);
    mongoose.plugin(Hidden);
    if(this.app.inTest) {
      //mongoose.plugin(Testable);
    }
  }

  private async discoverModels() {
    const modelsNamespace = this.app.namespacesMap.get('models');
    const alias = this.app;
    console.log(alias)
    return;
    const modelFiles = await readdir(base(dir));
    await Promise.all(
      modelFiles.map(name => import(base(dir, name)))
    );
  }
}
