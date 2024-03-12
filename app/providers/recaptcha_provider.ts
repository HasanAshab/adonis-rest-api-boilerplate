import { ApplicationService } from "@adonisjs/core/types";
import Recaptcha from 'recaptcha2'


export default class RecaptchaProvider {
  constructor(protected app: ApplicationService) {}

  public register() {
    this.app.container.singleton(Recaptcha, () => {
      const config = this.app.config.get('recaptcha')
      return new Recaptcha(config)
    })
  }
}
