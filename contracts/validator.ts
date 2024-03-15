declare module '@vinejs/vine' {
  interface VineString {
    unique(column: string): this;
    exists(column: string): this;
    password(strategyName: string): this;
    slug(): this;
  }
}
