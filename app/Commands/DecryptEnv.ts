import { Command } from "samer-artisan";
import { randomBytes, createDecipheriv } from 'crypto';
import fs from 'fs';

export default class DecryptEnv extends Command<{ key: string }, { force: boolean }> {
  signature = "env:decrypt {key} {--f|force}";
  description = "Decrypt environment variables";

  async handle() {
    const key = this.argument('key');
    const encryptedEnv = fs.readFileSync('.env.encrypted', 'utf-8');
    const parts = encryptedEnv.split(':');
    if (parts.length !== 2)
      return this.fail("Invalid encrypted environment format.");

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = Buffer.from(parts[1], 'hex');
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    const decryptedEnv = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    if(!this.option("force") && fs.existsSync('.env'))
      this.fail(".env file already exist.  (use -f to overwrite)")
    
    fs.writeFileSync('.env', decryptedEnv.toString('utf-8'));

    this.info("Environment variables decrypted and saved to .env");
  }
}
