import { execSync } from 'node:child_process'
import { BaseCommand } from '@adonisjs/core/ace'

export default class ClearUploads extends BaseCommand {
  static commandName = 'clear:uploads'

  run() {
    execSync('rm -r tmp/uploads')
    execSync('mkdir  tmp/uploads')
    this.logger.success('Uploads are cleared now!')
  }
}
