import is from '@adonisjs/core/helpers/is'
import { Response } from '@adonisjs/core/http'
import { BaseModel } from '@adonisjs/lucid/orm'
import { SimplePaginator } from '@adonisjs/lucid/database'
import { getStatusText } from 'http-status-codes'

/**
 * Getter to determine if the response is successful (status code within the 2xx range).
 */
Response.getter('isSuccessful', function (this: Response) {
  return this.response.statusCode >= 200 && this.response.statusCode < 300
})

/**
 * Getter to get the standard message associated with the response status code.
 */
Response.getter('standardMessage', function (this: Response) {
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
    this: Response,
    body: any | any[] = {},
    generateEtag = false
  ) {
    const acceptsJson = this.request.headers.accept === 'application/json'
    if (acceptsJson) {
      if (body instanceof SimplePaginator || body instanceof ResourceCollection || body instanceof JsonResource) {
        body = body.toJSON()
      }

      else if (is.null(body)) {
        body = {}
      } 
      else if (is.string(body)) {
        body = { message: body }
      }
      else if (is.number(body) || is.array(body) || body instanceof BaseModel) {
        body = { data: body }
      }

      
      body.success = body.success ?? this.isSuccessful;
      body.message = body.message ?? this.standardMessage;
    }

    return this.sendOriginal(body, generateEtag)
  }
)

/**
 * Macro to send a response with a specified HTTP status code and an empty body.
 * @param code - The HTTP status code.
 */
Response.macro('sendStatus', function (this: Response, code: number) {
  this.status(code).send({})
  return this
})

/**
 * Macro to set multiple response headers from an object.
 * @param data - The object containing header key-value pairs.
 */
Response.macro('setHeaders', function (this: Response, data: Record<string, any>) {
  for (const key in data) {
    this.header(key, data[key])
  }
  return this
})

/**
 * Macro to set multiple safe response headers from an object.
 * @param data - The object containing header key-value pairs.
 */
Response.macro('safeHeaders', function (this: Response, data: Record<string, any>) {
  for (const key in data) {
    this.safeHeader(key, data[key])
  }
  return this
})
