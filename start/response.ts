import Response from '@ioc:Adonis/Core/Response'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { SimplePaginator } from '@adonisjs/lucid/build/src/Database/Paginator/SimplePaginator'
import { types } from '@ioc:Adonis/Core/Helpers'
import { getStatusText } from 'http-status-codes'

/**
 * Getter to determine if the response is successful (status code within the 2xx range).
 */
Response.getter('isSuccessful', function () {
  return this.response.statusCode >= 200 && this.response.statusCode < 300
})

/**
 * Getter to get the standard message associated with the response status code.
 */
Response.getter('standardMessage', function () {
  return getStatusText(this.response.statusCode)
})

/**
 * The original response send method.
 */
Response.macro('sendOriginal', Response.prototype.send)

/**
 * Macro to send a response with enhanced JSON formatting and standard success/error message.
 * @param body - The response body.
 * @param generateEtag - Whether to generate an ETag header.
 */
Response.macro(
  'send',
  function (
    body: null | number | string | Record<string, any> | any[] = {},
    generateEtag = this.config.etag
  ) {
    const acceptsJson = this.request.headers.accept === 'application/json'
    if (acceptsJson) {
      if (body instanceof SimplePaginator || body instanceof ResourceCollection || body instanceof JsonResource) {
        body = body.toJSON()
      }

      else if (types.isNull(body)) {
        body = {}
      } 
      else if (types.isString(body)) {
        body = { message: body }
      }
      else if (types.isNumber(body) || types.isArray(body) || body instanceof BaseModel) {
        body = { data: body }
      }

      
      body.success = body.success ?? this.isSuccessful
      body.message = body.message ?? this.standardMessage
    }

    return this.sendOriginal(body, generateEtag)
  }
)

/**
 * Macro to send a response with a specified HTTP status code and an empty body.
 * @param code - The HTTP status code.
 */
Response.macro('sendStatus', function (code: number) {
  this.status(code).send({})
  return this
})

/**
 * Macro to set multiple response headers from an object.
 * @param data - The object containing header key-value pairs.
 */
Response.macro('setHeaders', function (data: object) {
  for (const key in data) {
    this.header(key, data[key])
  }
  return this
})

/**
 * Macro to set multiple safe response headers from an object.
 * @param data - The object containing header key-value pairs.
 */
Response.macro('safeHeaders', function (data: object) {
  for (const key in data) {
    this.safeHeader(key, data[key])
  }
  return this
})
