import "reflect-metadata";
import "dotenv/config";
import "~/vendor/autoload";
import "Config/load";

import Config from "Config";
import app from "~/main/app";

app.server.listen(Config.get("app.port"));