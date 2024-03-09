import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env/index'
import ThrottleMiddleware from '@adonisjs/limiter/build/throttle'
import { inject } from '@adonisjs/core'
import limiter from '@adonisjs/limiter/services/main'


export default class LimitRequestRate {
  public async handle(
    ctx: HttpContext,
    next: () => Promise<void>,
    store: string
  ) {
log(store)

  // log( limiter)
  // log( limiter.use(store))


    await next()
  }
}
