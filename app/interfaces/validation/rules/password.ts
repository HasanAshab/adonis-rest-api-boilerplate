export type PasswordStrategyName = 'complex' | 'standard' | 'weak'

export interface PasswordValidationStrategy {
  message: string
  validate(value: string): boolean | Promise<boolean>
}

export type PasswordValidationStrategyFactory = () =>
  | PasswordValidationStrategy
  | Promise<PasswordValidationStrategy>
