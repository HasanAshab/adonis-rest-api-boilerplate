import { ApplicationService } from "@adonisjs/core/types";
import { trace } from '#app/helpers'


export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  public boot() {
    if(!this.app.inProduction) {
      globalThis.log = console.log
      globalThis.trace = trace
    }
  }
}
