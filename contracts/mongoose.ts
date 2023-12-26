import Factory from 'App/Providers/MongooseProvider/Factory'
import Seeder from 'App/Providers/MongooseProvider/Seeder'

//type Constructor<T = any> = new (...args: any[]): T;

declare module '@ioc:Adonis/Mongoose/Factory' {
  export default Factory;
}

declare module '@ioc:Adonis/Mongoose/Seeder' {
  export default Seeder;
}