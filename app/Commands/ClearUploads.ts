import { execSync } from 'child_process'
import { BaseCommand } from "@adonisjs/core/ace";

export default class ClearUploads extends BaseCommand {
  public static commandName = 'clear:uploads'

  public run() {
    execSync('rm -r tmp/uploads')
    execSync('mkdir  tmp/uploads')
    this.logger.success('Uploads are cleared now!')
  }
}
