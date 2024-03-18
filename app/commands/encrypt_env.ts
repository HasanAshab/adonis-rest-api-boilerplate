import { BaseCommand, flags } from "@adonisjs/core/ace";
import { Encryption } from '@adonisjs/core/encryption'
import { readFileSync, writeFileSync } from 'fs';
import string from "@adonisjs/core/helpers/string";


export default class EncryptEnv extends BaseCommand {
  public static commandName = "env:encrypt";
  public static description = "Encrypt environment variables";

  @flags.string({
    default: string.generateRandom(16)
  })
  declare key: string
  
  public run() {
    const envContents = readFileSync('.env', 'utf-8');
    const encryptedEnv = new Encryption({ secret: this.key }).encrypt(envContents)
    writeFileSync('.env.encrypted', encryptedEnv, 'utf-8');
    this.logger.info("Key: " + this.key);
  }
}