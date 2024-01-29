import { BaseCommand } from '@adonisjs/core/build/standalone'
import { execSync } from "child_process";

export default class ClearUploads extends BaseCommand {
  public static commandName = "clear:uploads";
  
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  public run() {
    execSync("rm -r tmp/uploads");
    execSync("mkdir  tmp/uploads");
    this.logger.success("Uploads are cleared now!");
  }
}