/*
|--------------------------------------------------------------------------
| Define HTTP rate limiters
|--------------------------------------------------------------------------
|
| The "Limiter.define" method callback receives an instance of the HTTP
| context you can use to customize the allowed requests and duration
| based upon the user of the request.
|
*/
import { limiter } from "@adonisjs/limiter/services/main";

export const criticalThrottle = limiter.define('critical', () =>
  limiter.allowRequests(10).every('1 hour')
)

export const highThrottle = limiter.define('high', () =>
  limiter.allowRequests(50).every('1 hour')
)


export const standardThrottle = limiter.define('standard', () =>
  limiter.allowRequests(1000).every('1 hour')
)


export const minimalThrottle = limiter.define('minimal', () =>
  limiter.allowRequests(50).every('1 min')
)

export const lowThrottle = limiter.define('low', () =>
  limiter.allowRequests(100).every('1 min')
)
