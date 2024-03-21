import { BaseCommand, flags } from '@adonisjs/core/ace'
import { Encryption } from '@adonisjs/core/encryption'
import { readFileSync, writeFileSync } from 'node:fs'
import string from '@adonisjs/core/helpers/string'

export default class EncryptEnv extends BaseCommand {
  static commandName = 'env:encrypt'
  static description = 'Encrypt environment variables'

  @flags.string({
    default: string.generateRandom(16),
  })
  declare key: string

  async run() {
    const envContents = readFileSync('.env', 'utf-8')
    const encryptedEnv = new Encryption({ secret: this.key }).encrypt(envContents)
    writeFileSync('.env.encrypted', encryptedEnv, 'utf-8')
    this.logger.info('Key: ' + this.key)
  }
}
