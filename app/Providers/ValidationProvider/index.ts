import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import PasswordStrategyManager from "./Password/PasswordStrategyManager"


export default class PasswordValidationProvider {
  private passwordStrategyManager = new PasswordStrategyManager;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.passwordStrategyManager.register('complex', () => {
      const ComplexPasswordStrategy = require("./Password/Strategies/ComplexPasswordStrategy").default;
      return new StandardPasswordStrategy;
    });
    
    this.passwordStrategyManager.register('standard', () => {
      const StandardPasswordStrategy = require("./Password/Strategies/StandardPasswordStrategy").default;
      return new StandardPasswordStrategy;
    }).asDefault();
    
    this.passwordStrategyManager.register('weak', () => {
      const WeakPasswordStrategy = require("./Password/Strategies/WeakPasswordStrategy").default;
      return new WeakPasswordStrategy;
    });
    

    this.app.container.singleton('Adonis/Core/Validator/Rules/Password', () => ({
      PasswordStrategyManager: this.passwordStrategyManager
    }));
  }
  
  public async boot() {
    const { validator } = await import('@ioc:Adonis/Core/Validator');

    validator.rule('password', 
      async (value, [strategyName], options) => {
        const { strategy, name } = this.passwordStrategyManager.get(strategyName);

        if(await strategy.validate(value)) return;
        
        return options.errorReporter.report(
          options.pointer,
          `password.${name}`,
          strategy.message.replace("{{ field }}", options.field),
          strategy.message,
          options.arrayExpressionPointer
        );
      },
      () => ({ async: true })
    );
    
    validator.rule('slug', (value, _, options) => {
      const slugPattern = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
      if(slugPattern.test(value)) return;
        
      return options.errorReporter.report(
        options.pointer,
        'slug',
        `${options.field} must be a valid slug`,
        options.arrayExpressionPointer
      );
    });
  }
}