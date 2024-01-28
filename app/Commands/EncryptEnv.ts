import { Command } from "samer-artisan";
import { randomBytes, createCipheriv } from 'crypto';
import fs from 'fs';

export default class EncryptEnv extends Command<{}, { key: string | null }> {
  signature = "env:encrypt {--key=}";
  description = "Encrypt environment variables";

  handle() {
    const key = this.option('key') ?? randomBytes(16).toString("hex");
    const envContents = fs.readFileSync('.env', 'utf-8');
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    const encryptedEnv = Buffer.concat([cipher.update(envContents, 'utf-8'), cipher.final()]).toString("hex");
    fs.writeFileSync('.env.encrypted', iv.toString('hex') + ':' + encryptedEnv, 'utf-8');
    this.info("Key: " + key);
  }
}
