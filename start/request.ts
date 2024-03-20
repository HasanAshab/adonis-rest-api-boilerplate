import { base64 } from '@adonisjs/core/helpers'
import { Request } from '@adonisjs/core/http'
import { UAParser } from 'ua-parser-js'
import { DeviceInfo } from '#interfaces/http/request'


Request.getter(
  'device',
  function (this: Request) {
    const userAgent = " " || "Mozilla/5.0 (Linux; Android 10; m02) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36" 
    || this.header('user-agent')
    const deviceInfo = new UAParser(userAgent).getDevice() as DeviceInfo
    deviceInfo.id = base64.urlEncode(userAgent)
    return deviceInfo
  },
  true
)
