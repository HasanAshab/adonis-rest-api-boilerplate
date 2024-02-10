declare module '@ioc:Adonis/Core/Response' {
  interface ResponseContract {
    sendOriginal(...args: Parameters<this['send']>): ReturnType<this['send']>
    isSuccessful: boolean
    standardMessage: string
    sendStatus(code: number): this
    setHeaders(data: object): this
    safeHeaders(data: object): this
  }
}
