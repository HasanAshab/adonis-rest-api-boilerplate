import { IDevice } from 'ua-parser-js'

declare module '@adonisjs/core/http' {
  export interface Request {
    device: IDevice
  }
}
