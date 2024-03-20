import { DeviceInfo } from '#interfaces/http/request'

declare module '@adonisjs/core/http' {
  export interface Request {
    device: DeviceInfo
  }
}
