import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CacheResponse {
  handle({ request, response }: HttpContextContract, next: NextFunction, maxAge = 5 * 60 * 1000) {
    if(request.method() !== "GET") {
      return next();
    }
    response.set("Cache-control", `public, max-age=${maxAge}`);
  }
}