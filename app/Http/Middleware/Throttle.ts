import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BaseThrottler from '@adonisjs/limiter/build/throttle'
import { Limiter } from '@adonisjs/limiter/build/services'
import { inject } from '@adonisjs/core/build/standalone'

@inject(['Adonis/Addons/Limiter'])
export default class Throttle extends BaseThrottler {
  constructor(private limiter: LimiterManager<any, any>) {
    super();
  }

  public async handle(ctx: HttpContextContract, next: () => Promise<void>, [duration, count]: string[]) {
    if(!count) {
      return await super.handle(ctx, next, duration);
    }

    const configBuilder = Limiter.allowRequests(parseInt(count)).every(parseInt(duration));
    await this.rateLimitRequest('dynamic', ctx, configBuilder)
  
    await next()
  }
}
