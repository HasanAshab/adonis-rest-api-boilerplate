import { ApplicationService } from "@adonisjs/core/types";

export default class AuthProvider {
  constructor(protected app: ApplicationService) {}

  private registerTwoFactorMethodManager() {
    this.app.container.singleton('Adonis/Addons/Auth/TwoFactor', () => {
      const TwoFactorMethodManager = require('./TwoFactor/TwoFactorMethodManager').default
      return {
        TwoFactorMethod: new TwoFactorMethodManager()
      }
    })
  }
  
  private registerTwoFactorMethods() {
    const { TwoFactorMethod } = this.app.container.use('Adonis/Addons/Auth/TwoFactor')

    TwoFactorMethod.register([
      require('./TwoFactor/Methods/AuthenticatorMethod').default,
      require('./TwoFactor/Methods/SmsMethod').default,
      require('./TwoFactor/Methods/CallMethod').default
    ])
  }

  public boot() {
    this.registerTwoFactorMethodManager()
    this.registerTwoFactorMethods()
  }
}
