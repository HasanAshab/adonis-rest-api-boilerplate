import { Request } from '@adonisjs/core/http'
import { UAParser } from 'ua-parser-js'
import DeviceIdRequiredException from '#exceptions/device_id_required_exception'


Request.macro('device', function (this: Request) {
  const userAgent = this.header('user-agent')
  const id = this.header('device-id')
  if(!id) {
    throw new DeviceIdRequiredException()
  }
  const device = new UAParser(userAgent).getDevice() as DeviceInfo
  device.id = id
  return device
})
