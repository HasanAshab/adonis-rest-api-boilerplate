import { PasswordStrategy, PasswordValidationStrategy } from '@ioc:Adonis/Core/Validator/Rules/Password'

export type PasswordValidationStrategyFactory = () => PasswordValidationStrategy

export default class PasswordStrategyManager {
  protected _defaultStrategy?: PasswordStrategy
  protected strategies = new Map<string, PasswordValidationStrategy>()
  protected factories = new Map<string, PasswordValidationStrategyFactory>()
  
  public defaultStrategy(name: PasswordStrategy) {
    this._defaultStrategy = name;
    return this;
  }
  
  public register(name: PasswordStrategy, strategyFactory: string | PasswordValidationStrategyFactory) {
    if (typeof strategyFactory === 'string') {
      const path = strategyFactory
      strategyFactory = () => {
        const Strategy = require(path).default
        return new Strategy()
      }
    }

    this.factories.set(name, strategyFactory)

    const markAsDefault = () => {
      this._defaultStrategy = name
    }

    return { asDefault: markAsDefault }
  }

  public use(name = this._defaultStrategy) {
    if (!name) {
      throw new Error('Must provide a strategy name as no default strategy registered')
    }

    const strategy = this.strategies.get(name) ?? this.resolveStrategy(name)
    return { name, strategy }
  }

  protected resolveStrategy(name: PasswordStrategy) {
    const factory = this.factories.get(name)
    if (!factory) {
      throw new Error(`Password validation strategy "${name}" was not registered`)
    }

    const strategy = factory()

    this.factories.delete(name)
    this.strategies.set(name, strategy)

    return strategy
  }
}
