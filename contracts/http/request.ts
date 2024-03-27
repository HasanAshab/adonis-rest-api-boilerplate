import type { DeviceInfo } from '#interfaces/http/request'
import { UAParserInstance } from 'ua-parser-js'

declare module '@adonisjs/core/http' {
  interface Request {
    userAgent: UAParserInstance
    device(): DeviceInfo
    deviceId(): string
  }
}
