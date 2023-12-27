import { PasswordValidationStrategy } from '@ioc:Adonis/Core/Validator/Rules/Password'

export default class PasswordStrategyManager {
  protected strategies = new Map<string, PasswordValidationStrategy>();
  
  async register(strategy: PasswordValidationStrategy | (() => PasswordValidationStrategy | Promise<PasswordValidationStrategy>)) {
    if(typeof strategy === "function") {
      strategy = await strategy();
    }
    this.strategies.set(strategy.name, strategy);
    return this;
  }
  
  get(name: string) {
    const strategy = this.strategies.get(name);
    if(!strategy) {
      throw new Error(`Password validation strategy "${name}" was not registererd`);
    }
    return strategy;
  }
}