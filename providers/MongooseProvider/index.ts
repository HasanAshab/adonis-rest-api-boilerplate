import type { ApplicationContract } from '@ioc:Adonis/Core/Application';
import Logger from '@ioc:Adonis/Core/Logger';
import Config from '@ioc:Adonis/Core/Config';
import MongoDbAuthProvider from './MongoDbAuthProvider'
import mongoose from 'mongoose';
import Helpers from './Plugins/Helpers';
//import Assertable from './Plugins/Assertable';
import Paginate from './Plugins/Paginate';
import Transform from './Plugins/Transform';
import Hidden from './Plugins/Hidden';
//import Testable from './Plugins/Testable';

export default class MongooseProvider {
  static needsApplication = true;

  constructor(protected app: ApplicationContract) {}

  public async register() {
    this.setConfig();
    this.registerGlobalPlugins();
  }

  public async boot() {
    const { connect, syncIndexes } = Config.get('mongoose');
    
    connect && await this.connect();
    syncIndexes && await mongoose.syncIndexes();
    
    await import('./validator');
    
    this.registerUserProvider();
  }

  private setConfig() {
    mongoose.set('strictQuery', true);
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
  
  private registerUserProvider() {
    const Auth = this.app.container.resolveBinding('Adonis/Addons/Auth');
    const Hash = this.app.container.resolveBinding('Adonis/Core/Hash');

    Auth.extend('provider', 'mongo', (_, __, config) => {
      return new MongoDbAuthProvider(config, Hash)
    });
  }

  private async connect() {
    try {
      await mongoose.connect(Config.get('mongoose.url'), Config.get('mongoose.options'));
      Logger.info('Connected to database [MONGOOSE]');
    }
    catch(err) {
      Logger.error('Could not connect to database. reason\n, %o', err.stack);
    }
  }
}