import Response from '@ioc:Adonis/Core/Response'
import { types } from '@ioc:Adonis/Core/Helpers'
import { getStatusText } from 'http-status-codes'

Response.getter('isSuccessful', function () {
  return this.response.statusCode >= 200 && this.response.statusCode < 300
})

Response.getter('standardMessage', function () {
  return getStatusText(this.response.statusCode)
})

Response.macro('sendOriginal', Response.prototype.send)

Response.macro(
  'send',
  function (
    body: null | number | string | Record<string, any> | any[] = {},
    generateEtag = this.config.etag
  ) {
    const acceptsJson = this.request.headers.accept === 'application/json'
    if (acceptsJson) {
      if (types.isNull(body)) {
        body = {}
      } else if (types.isString(body)) {
        body = { message: body }
      } else if (body.toJSON) {
        body = body.toJSON()
      } else if (types.isNumber(body) || types.isArray(body)) {
        body = { data: body }
      }

      if (!body.success) {
        body.success = this.isSuccessful
      }

      if (!body.message) {
        body.message = this.standardMessage
      }
    }

    return this.sendOriginal(body, generateEtag)
  }
)

Response.macro('sendStatus', function (code: number) {
  this.status(code).send({})
  return this
})

Response.macro('setHeaders', function (data: object) {
  for (const key in data) {
    this.header(key, data[key])
  }
  return this
})

Response.macro('safeHeaders', function (data: object) {
  for (const key in data) {
    this.safeHeader(key, data[key])
  }
  return this
})
