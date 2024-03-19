declare module '@vinejs/vine' {
  interface VineString {
    unique(reference: string): this
    exists(reference: string): this
    password(strategyName: string): this
    slug(): this
  }
}
