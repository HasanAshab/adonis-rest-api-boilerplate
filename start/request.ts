import { Request } from '@adonisjs/core/http'
import { UAParser } from 'ua-parser-js'
import DeviceIdRequiredException from '#exceptions/device_id_required_exception'


Request.getter('userAgent', function(this: Request) {
  return new UAParser(this.header('USER-AGENT'))
}, true)

Request.macro('deviceId', function (this: Request) {
  const deviceId = this.header('X-DEVICE-ID')
  if(!deviceId) {
    throw new DeviceIdRequiredException()
  }
  return deviceId
})

Request.macro('device', function (this: Request) {
  const userAgent = this.header('USER-AGENT')
  const device = this.userAgent.getDevice() as DeviceInfo
  device.id = this.deviceId()
  return device
})
