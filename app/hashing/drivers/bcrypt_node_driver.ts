import bcrypt from 'bcryptjs'
import { HashDriverContract } from "@adonisjs/core/hash";
import { BcryptNodeConfig } from "@adonisjs/core/hash";

export default class BcryptNodeDriver implements HashDriverContract {
  constructor(private config: BcryptNodeConfig) {
    this.config = config
  }

  public async make(value: string) {
    return await bcrypt.hash(value, this.config.rounds)
  }

  public async verify(hashedValue: string, plainValue: string) {
    return await bcrypt.compare(plainValue, hashedValue)
  }
}
