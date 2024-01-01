import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import PasswordStrategyManager from "./PasswordStrategies/PasswordStrategyManager"
import ComplexPasswordStrategy from "./PasswordStrategies/ComplexPasswordStrategy"
import StandardPasswordStrategy from "./PasswordStrategies/StandardPasswordStrategy"
import WeakPasswordStrategy from "./PasswordStrategies/WeakPasswordStrategy"


export default class PasswordValidationProvider {
  private passwordStrategyManager = new PasswordStrategyManager;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.passwordStrategyManager.register(new ComplexPasswordStrategy);
    this.passwordStrategyManager.register(new StandardPasswordStrategy).asDefault();
    this.passwordStrategyManager.register(new WeakPasswordStrategy);
    
    this.app.container.singleton('Adonis/Core/Validator/Rules/Password', () => ({
      PasswordStrategyManager: this.passwordStrategyManager
    }));
  }
  
  public async boot() {
    const { validator } = await import('@ioc:Adonis/Core/Validator');

    validator.rule('password', 
      async (value, [strategyName], options) => {
        const strategy = this.passwordStrategyManager.get(strategyName);
    
        if(await strategy.validate(value)) return;
        
        return options.errorReporter.report(
          options.pointer,
          `password.${strategy.name}`,
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