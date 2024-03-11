import { BaseCommand } from "@adonisjs/core/ace";
import { randomBytes, createDecipheriv } from 'crypto';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { args } from "@adonisjs/core/ace";
import { flags } from "@adonisjs/core/ace";


export default class DecryptEnv extends BaseCommand {
  public static commandName = "env:decrypt"
  public static description = "Decrypt environment variables"
  public static settings = { loadApp: true }
  
  @args.string()
  declare key: string
  
  @flags.boolean()
  declare force: boolean

  async handle() {
    const encryptedEnv = readFileSync('.env.encrypted', 'utf-8');
    const parts = encryptedEnv.split(':');
    if (parts.length !== 2)
      return this.fail("Invalid encrypted environment format.");

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = Buffer.from(parts[1], 'hex');
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(this.key), iv);
    const decryptedEnv = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    if(!this.force && existsSync('.env')) {
      this.fail(".env file already exist.  (use -f to overwrite)")
    }
    
    log(decryptedEnv.toString('utf-8'))
   // writeFileSync('.env', decryptedEnv.toString('utf-8'));

    this.info("Environment variables decrypted and saved to .env");
  }
}