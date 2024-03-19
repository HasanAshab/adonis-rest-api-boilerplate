import {
  PasswordStrategyName,
  PasswordValidationStrategy,
  PasswordValidationStrategyFactory,
} from '#interfaces/validation/rules/password'

export class PasswordStrategyManager {
  protected strategies = new Map<string, PasswordValidationStrategy>()
  protected factories = new Map<string, PasswordValidationStrategyFactory>()

  register(name: PasswordStrategyName, factory: PasswordValidationStrategyFactory) {
    this.factories.set(name, factory)
    return this
  }

  async use(name: PasswordStrategyName) {
    return this.strategies.get(name) ?? (await this.resolve(name))
  }

  protected async resolve(name: PasswordStrategy) {
    const factory = this.factories.get(name)
    if (!factory) {
      throw new Error(`Password validation strategy "${name}" was not registered`)
    }

    const strategy = await factory()

    this.factories.delete(name)
    this.strategies.set(name, strategy)

    return strategy
  }
}

export default new PasswordStrategyManager()
