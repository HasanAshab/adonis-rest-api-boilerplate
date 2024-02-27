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

export const { httpLimiters } = limiter.define('global', () =>
  limiter.allowRequests(100).every('1 min')
)
