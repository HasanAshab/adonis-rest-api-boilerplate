import { PasswordValidationStrategy } from '@ioc:Adonis/Core/Validator/Rules/Password'
import StrongPasswordStrategy from "App/Services/PasswordStrategies/StrongPasswordStrategy"
import MediumPasswordStrategy from "App/Services/PasswordStrategies/MediumPasswordStrategy"
import WeakPasswordStrategy from "App/Services/PasswordStrategies/WeakPasswordStrategy"

export default class PasswordStrategyManager {
  protected strategies = new Map<string, PasswordValidationStrategy>([
    ["strong", new StrongPasswordStrategy],
    ["medium", new MediumPasswordStrategy],
    ["weak", new WeakPasswordStrategy]
  ]);
  
  async register(name: string, strategy: PasswordValidationStrategy | (() => PasswordValidationStrategy | Promise<PasswordValidationStrategy>)) {
    if(typeof strategy === "function") {
      strategy = await strategy();
    }
    this.strategies.set(name, strategy);
    return this;
  }
  
  get(name: string) {
    const strategy = this.strategies.get(name);
    if(!name) {
      throw new Error(`Password validation strategy "${name}" was not registererd`);
    }
    return strategy;
  }
}