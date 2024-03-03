import { ApplicationService } from "@adonisjs/core/types";
import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import passwordStrategy from '#app/validation/rules/password/password_strategy_manager'


export default class ValidationProvider {
  constructor(protected app: ApplicationService) {}

  private registerMessagesProvider() {
    vine.messagesProvider = new SimpleMessagesProvider(this.app.config.get('validator.customMessages'))
  }
  
  private registerPasswordStrategies() {
    passwordStrategy.register('standard', async () => {
      const { default: StandardPasswordStrategy } = await import('#app/validation/rules/password/strategies/standard_password_strategy')
      return new StandardPasswordStrategy()
    })
    
    passwordStrategy.register('complex', async () => {
      const { default: ComplexPasswordStrategy } = await import('#app/validation/rules/password/strategies/complex_password_strategy')
      return new ComplexPasswordStrategy()
    })
    
    passwordStrategy.register('weak', async () => {
      const { default: WeakPasswordStrategy } = await import('#app/validation/rules/password/strategies/weak_password_strategy')
      return new WeakPasswordStrategy()
    })
  }

  public register() {
    this.registerMessagesProvider()
    this.registerPasswordStrategies()
  }
}
