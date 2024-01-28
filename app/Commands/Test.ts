import { Command } from "samer-artisan";

export default class Test extends Command {
  signature = "test {a} {--B|ball} {--cks}";

  async handle(){
    console.log(this.arguments())
    console.log(this.options())
    this.info("Done")
  }
}