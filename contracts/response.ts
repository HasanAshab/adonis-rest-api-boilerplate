declare module '@adonisjs/core/http' {
  export interface Response {
    isSuccessful: boolean
    standardMessage: string
    sendOriginal(...args: Parameters<this['send']>): ReturnType<this['send']>
    sendStatus(code: number): this
    setHeaders(data: object): this
    safeHeaders(data: object): this
  }
}
