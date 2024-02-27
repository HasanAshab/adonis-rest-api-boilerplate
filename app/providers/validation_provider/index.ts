import Config from '@ioc:adonis/core/config'
import { ApplicationService } from "@adonisjs/core/types";

export default class ValidationProvider {
  constructor(protected app: ApplicationService) {}

  private registerPasswordStrategyManager() {
    this.app.container.singleton('Adonis/Core/Validator/Rules/Password', () => {
      const PasswordStrategyManager = require('./Password/PasswordStrategyManager').default
      return {
        PasswordStrategy: new PasswordStrategyManager()
      }
    })
  }
  
  private registerPasswordStrategies() {
   const { PasswordStrategy } = this.app.container.use('Adonis/Core/Validator/Rules/Password')
    
    PasswordStrategy.defaultStrategy(Config.get('app.constraints.user.password.strategy'))
    
    PasswordStrategy.register('standard', () => {
      const StandardPasswordStrategy =
        require('./Password/Strategies/StandardPasswordStrategy').default
      return new StandardPasswordStrategy()
    })

    PasswordStrategy.register('complex', () => {
      const ComplexPasswordStrategy =
        require('./Password/Strategies/ComplexPasswordStrategy').default
      return new ComplexPasswordStrategy()
    })

    PasswordStrategy.register('weak', () => {
      const WeakPasswordStrategy = require('./Password/Strategies/WeakPasswordStrategy').default
      return new WeakPasswordStrategy()
    })
  }

  public boot() {
    this.registerPasswordStrategyManager()
    this.registerPasswordStrategies()
  }
}
