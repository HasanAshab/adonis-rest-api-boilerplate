import { createHash } from 'node:crypto'
import { Request } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { UAParser } from 'ua-parser-js'


Request.macro('device', function(this: Request) {
  const userAgent = this.header('user-agent')
  const deviceInfo = new UAParser(userAgent).getDevice()
  deviceInfo.id = createHash('sha256').update(userAgent).digest('hex')
  return deviceInfo
})