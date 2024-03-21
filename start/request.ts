import { Request } from '@adonisjs/core/http'
import { UAParser } from 'ua-parser-js'


Request.getter(
  'device',
  function (this: Request) {
    const userAgent = this.header('user-agent')
    return new UAParser(userAgent).getDevice()
  },
  true
)
