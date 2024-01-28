import { Command } from "samer-artisan";
import Cache from "Cache";

export default class ClearCache extends Command<{}, { driver: string | null }> {
  signature = "clear:cache {--driver=}";

  async handle() {
    const driver = this.option("driver") ?? undefined;
    await Cache.driver(driver).flush();
    this.info("Cache cleared successfully!");
  }
}