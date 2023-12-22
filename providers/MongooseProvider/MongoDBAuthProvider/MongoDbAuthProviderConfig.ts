import type { IUser } from 'App/Models/User'

export type MongoDbAuthProviderConfig = {
  driver: 'mongo';
  uid: keyof IUser;
}