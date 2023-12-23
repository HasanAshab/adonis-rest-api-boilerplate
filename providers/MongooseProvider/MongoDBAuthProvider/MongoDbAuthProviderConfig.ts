import { Model } from "mongoose"

export interface MongoDbAuthProviderConfig<IUser> = {
  driver: 'mongo';
  uids: keyof IUser[];
  model(): Model | Promise<Model>;
}