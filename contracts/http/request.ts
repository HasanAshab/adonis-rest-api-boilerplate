import { DeviceInfo } from '#interfaces/http/request'
import { UAParser } from 'ua-parser-js'

declare module '@adonisjs/core/http' {
  export interface Request {
    userAgent: UAParser
    device(): DeviceInfo
    deviceId(): string
  }
}
