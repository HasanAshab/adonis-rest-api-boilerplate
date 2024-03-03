import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env/index'
import ThrottleMiddleware from '@adonisjs/limiter/build/throttle'
import { inject } from '@adonisjs/core'
import { limiter } from "@adonisjs/limiter/services/main";
//todo


@inject(['Adonis/Addons/Limiter'])
export default class LimitRequestRate extends ThrottleMiddleware {
  constructor(private limiter: LimiterManager<any, any>) {
    super()
  }

  public async handle(
    ctx: HttpContext,
    next: () => Promise<void>,
    [duration, count]: string[]
  ) {
    if (env.get('NODE_ENV') === 'test') {
      return await next()
    }

    if (!count) {
      return await super.handle(ctx, next, duration)
    }

    const configBuilder = limiter.allowRequests(parseInt(count)).every(duration)

    await this.rateLimitRequest('dynamic', ctx, configBuilder)

    await next()
  }
}
