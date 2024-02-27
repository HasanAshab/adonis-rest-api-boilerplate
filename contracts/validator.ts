declare module '@ioc:Adonis/Core/Validator' {
  type PasswordStrategy = 'complex' | 'standard' | 'weak'

  interface Rules {
    slug(): Rule
    password(strategy?: PasswordStrategy): Rule
  }
}

declare module '@ioc:Adonis/Core/Validator/Rules/Password' {
  import type PasswordStrategyManager from 'app/providers/validation_provider/password/password_strategy_manager'

  interface PasswordValidationStrategy {
    message: string
    validate(value: unknown): boolean | Promise<boolean>
  }

  const PasswordStrategy: PasswordStrategyManager
}
