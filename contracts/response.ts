declare module '@ioc:Adonis/Core/Response' {
  interface ResponseContract {
    isSuccessful: boolean;
    standardMessage: string;
    api(data: object | any[]): void;
    message(text?: string): void;
    sendStatus(code: number): void;
    setHeaders(data: object): void;
    safeHeaders(data: object): void;
  }
}
