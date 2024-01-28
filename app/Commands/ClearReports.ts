import { Command } from "samer-artisan";
import { execSync } from "child_process";

export default class ClearReports extends Command {
  signature = "clear:reports {name}";
  
  handle() {
    const name = this.argument("name");
    execSync("rm -r storage/reports/" + name);
    execSync("mkdir  storage/reports/" + name);
    this.info(name + " reports are clear now!");
  }
}