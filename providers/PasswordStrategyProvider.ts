import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import PasswordStrategyManager from "App/Services/PasswordStrategies/PasswordStrategyManager"

export default class PasswordStrategyProvider {
  static needsApplication = true;
  
  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Adonis/Core/Validator/Rules/Password', () => ({
      PasswordStrategyManager: new PasswordStrategyManager
    }));
  }
}
