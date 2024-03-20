import { ApplicationService } from '@adonisjs/core/types'
import { trace } from '#app/helpers'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  boot() {
    if (!this.app.inProduction) {
      global.log = console.log
      global.trace = trace
    }
  }
}
