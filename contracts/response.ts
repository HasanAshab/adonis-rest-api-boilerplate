declare module '@ioc:Adonis/Core/Response' {
  interface ResponseContract {
    isSuccessful: boolean
    standardMessage: string
    api(data: object | any[]): this
    message(text?: string): this
    sendStatus(code: number): this
    setHeaders(data: object): this
    safeHeaders(data: object): this
  }
}
