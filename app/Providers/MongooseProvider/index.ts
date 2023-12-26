import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Logger from '@ioc:Adonis/Core/Logger'
import Config from '@ioc:Adonis/Core/Config'
import mongoose from 'mongoose'
import Factory from './Factory'
import Seeder from './Seeder'
import Helpers from './Plugins/Helpers'
import Assertable from './Plugins/Assertable'
import Paginate from './Plugins/Paginate'
import Transform from './Plugins/Transform'
import Hidden from './Plugins/Hidden'
import Testable from './Plugins/Testable'


export default class MongooseProvider {
  constructor(protected app: ApplicationContract) {}

  private async connect() {
    try {
      await mongoose.connect(Config.get('mongoose.url'), Config.get('mongoose.options'));
      Logger.info('Connected to database [MONGOOSE]');
    }
    catch(err) {
      Logger.error('Could not connect to database. reason\n, %o', err.stack);
    }
  }

  private setConfig() {
    mongoose.set('strictQuery', true);
  }
  
  private registerGlobalPlugins() {
    mongoose.plugin(Helpers);
    mongoose.plugin(Assertable);
    mongoose.plugin(Paginate);
    mongoose.plugin(Transform);
    mongoose.plugin(Hidden);
    if(this.app.inTest) {
      mongoose.plugin(Testable);
    }
  }
  
  private async registerUserProvider() {
    const { default: MongoDBAuthProvider } = await import('./MongoDBAuthProvider');

    const Auth = this.app.container.resolveBinding('Adonis/Addons/Auth');
    const Hash = this.app.container.resolveBinding('Adonis/Core/Hash');

    Auth.extend('provider', 'mongo', (_, __, config) => {
      return new MongoDBAuthProvider(config, Hash)
    });
  }
  
  private registerFactoryAndSeeder() {
    this.app.container.singleton('Adonis/Mongoose/Factory', () => {
      return Factory;
    });
    
    this.app.container.singleton('Adonis/Mongoose/Seeder', () => {
      return Seeder;
    });
  }
  
  public async register() {
    this.setConfig();
    this.registerGlobalPlugins();
    this.registerFactoryAndSeeder();
  }

  public async boot() {
    const { connect, syncIndexes } = Config.get('mongoose');
    
    connect && await this.connect();
    syncIndexes && await mongoose.syncIndexes();
    
    await Promise.all([
      import('./validator'),
      this.registerUserProvider()
    ]);
  }
}