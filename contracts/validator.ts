declare module '@vinejs/vine' {
  interface VineString {
    exists(column: string): this
    unique(column: string): this
    slug(): this
    password(strategyName: PasswordStrategyName): this
  }
}