import { PasswordValidationStrategy } from '@ioc:Adonis/Core/Validator/Rules/Password'

export default class PasswordStrategyManager {
  protected defaultStrategy?: string;
  protected strategies = new Map<string, PasswordValidationStrategy>();
  
  register(strategy: PasswordValidationStrategy | (() => PasswordValidationStrategy)) {
    if(typeof strategy === "function") {
      strategy = strategy();
    }
    this.strategies.set(strategy.name, strategy);
    
    const markAsDefault = () => {
      this.defaultStrategy = strategy.name;
    }
    
    return { asDefault: markAsDefault };
  }
  
  get(name = this.defaultStrategy) {
    if(!name) {
      throw new Error('Must provide a strategy name as no default strategy registered');
    }
    const strategy = this.strategies.get(name);
    if(!strategy) {
      throw new Error(`Password validation strategy "${name}" was not registered`);
    }
    return strategy;
  }
}