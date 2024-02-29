declare module '@ioc:Adonis/Core/Validator/Rules/Password' {
  import type PasswordStrategyManager from 'app/providers/validation_provider/password/password_strategy_manager'

  interface PasswordValidationStrategy {
    message: string
    validate(value: unknown): boolean | Promise<boolean>
  }

  const PasswordStrategy: PasswordStrategyManager
}


declare module '@vinejs/vine' {
  type PasswordStrategy = 'complex' | 'standard' | 'weak'

  interface VineString {
    unique(column: string): this
    slug(): this
    password(strategy?: PasswordStrategy): Rule
  }
}