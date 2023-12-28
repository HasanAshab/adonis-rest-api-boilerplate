import Factory from './Factory'
import Seeder from './Seeder'

//type Constructor<T = any> = new (...args: any[]): T;

declare module '@ioc:Adonis/Mongoose/Factory' {
  export default Factory;
}

declare module '@ioc:Adonis/Mongoose/Seeder' {
  export default Seeder;
}