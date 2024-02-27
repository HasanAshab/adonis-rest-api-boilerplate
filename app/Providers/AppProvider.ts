import { ApplicationService } from "@adonisjs/core/types";

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  public boot() {
    //
  }
}
