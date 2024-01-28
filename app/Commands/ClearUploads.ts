import { Command } from "samer-artisan";
import { execSync } from "child_process";

export default class ClearUploads extends Command {
  signature = "clear:uploads";
  
  handle() {
    execSync("rm -r storage/public/uploads");
    execSync("mkdir  storage/public/uploads");
    this.info("Uploads are cleared now!");
  }
}