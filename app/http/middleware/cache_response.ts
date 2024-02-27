import type { HttpContext } from '@adonisjs/core/http'

export default class CacheResponse {
  handle({ request, response }: HttpContext, next: NextFunction, maxAge = 5 * 60 * 1000) {
    if (request.method() !== 'GET') {
      return next()
    }
    response.set('Cache-control', `public, max-age=${maxAge}`)
  }
}
