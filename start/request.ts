import { createHash } from 'node:crypto'
import { Request } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { UAParser } from 'ua-parser-js'

Request.getter(
  'device',
  function (this: Request) {
    const userAgent = " " || "Mozilla/5.0 (Linux; Android 10; m02) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36" 
    || this.header('user-agent')
    const deviceInfo = new UAParser(userAgent).getDevice()
    deviceInfo.id = createHash('sha256').update(userAgent).digest('hex')
    return deviceInfo
  },
  true
)
