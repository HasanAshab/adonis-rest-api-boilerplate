import { model, modelNames } from "mongoose";

export function resetDatabase(models = modelNames()) {
  const promises = models.map(name => model(name).deleteMany());
  return Promise.all(promises);
}