import { BaseCommand } from "@adonisjs/core/ace";
import { Encryption } from '@adonisjs/core/encryption'
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

  public async run() {
    if(this.key.length < 16) {
      return this.logger.error('"key" must be at least 16 char long')
    }

    const encryption = new Encryption({ secret: this.key })
    const encryptedEnv = readFileSync('.env.encrypted', 'utf-8');
    const decryptedEnv = encryption.decrypt(encryptedEnv);
    
    if(!decryptedEnv) {
      return this.logger.error('Invalid env key.')
    }
    
    if(!this.force && existsSync('.env')) {
      const overwrite = await this.prompt.confirm(".env file already exist. want to overwrite?")
      if(!overwrite) {
        return console.log(decryptedEnv)
      }
    }
    
    writeFileSync('.env', decryptedEnv);
    this.logger.success("Environment variables decrypted and saved to .env");
  }
}