import { Command } from "samer-artisan";
import crypto from "crypto";

export default class GenerateKey extends Command {
  signature = "key:generate";
  
  async handle() {
    const secret = crypto.randomBytes(32).toString("hex");
    await putEnv({ APP_KEY: secret });
    this.info(`Key generated: ${secret}`);
  }
}