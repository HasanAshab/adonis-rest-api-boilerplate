import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import ThrottleMiddleware from '@adonisjs/limiter/build/throttle'
import { Limiter } from '@adonisjs/limiter/build/services'
import { inject } from '@adonisjs/core/build/standalone'

@inject(['Adonis/Addons/Limiter'])
export default class LimitRequestRate extends ThrottleMiddleware {
  constructor(private limiter: LimiterManager<any, any>) {
    super()
  }

  public async handle(
    ctx: HttpContextContract,
    next: () => Promise<void>,
    [duration, count]: string[]
  ) {
    if (Env.get('NODE_ENV') === 'test') {
      return await next()
    }

    if (!count) {
      return await super.handle(ctx, next, duration)
    }

    const configBuilder = Limiter.allowRequests(parseInt(count)).every(duration)

    await this.rateLimitRequest('dynamic', ctx, configBuilder)

    await next()
  }
}
