import { PasswordStrategyName } from '#interfaces/validation/rules/password'

declare module '@vinejs/vine' {
  interface VineString {
    unique(reference: string): this
    exists(reference: string): this
    password(strategyName: PasswordStrategyName): this
    slug(): this
  }
}
