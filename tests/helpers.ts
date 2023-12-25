import { join } from "path";
import { model, modelNames } from "mongoose";

globalThis.resetDatabase = function resetDatabase(models = modelNames()) {
  const promises = models.map(name => model(name).deleteMany());
  return Promise.all(promises);
}

globalThis.filePath = function filePath(name: string) {
  return join(__dirname, '../tmp/test/', name);
}