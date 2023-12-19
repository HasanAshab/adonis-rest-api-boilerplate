import Env from '@ioc:Adonis/Core/Env'
import { ConnectOptions } from "mongoose";

/*
|--------------------------------------------------------------------------
|  Connect to Database
|--------------------------------------------------------------------------
| Wether to connect to database or not
*/
export const connect: boolean = true;


/*
|--------------------------------------------------------------------------
| Syncronize Database Indexes
|--------------------------------------------------------------------------
| Wether to syncronize database indexes or not
*/
export const syncIndexes: boolean = true;


/*
|--------------------------------------------------------------------------
|  Load Models
|--------------------------------------------------------------------------
| Wether to load models or not
*/
export const loadModels: boolean = true;


/*
|--------------------------------------------------------------------------
|  Database URL
|--------------------------------------------------------------------------
| The url (connection string) that will be used to connect to database
*/
export const url: string = Env.get("DATABASE_URL", "");

/*
|--------------------------------------------------------------------------
|  Mongoose Options
|--------------------------------------------------------------------------
| Options that will be used when connecting to database through mongoose
*/
export const options: ConnectOptions = {
  maxPoolSize: 1
}

