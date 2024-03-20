import { base64 } from '@adonisjs/core/helpers'
import { Request } from '@adonisjs/core/http'
import { UAParser } from 'ua-parser-js'
import { DeviceInfo } from '#interfaces/http/request'


Request.getter(
  'device',
  function (this: Request) {
    const userAgent = this.header('user-agent')
    const deviceInfo = new UAParser(userAgent).getDevice() as DeviceInfo
    deviceInfo.id = base64.urlEncode(userAgent)
    return deviceInfo
  },
  true
)
