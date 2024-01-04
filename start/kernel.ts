/*
|--------------------------------------------------------------------------
| Application middleware
|--------------------------------------------------------------------------
|
| This file is used to define middleware for HTTP requests. You can register
| middleware as a `closure` or an IoC container binding. The bindings are
| preferred, since they keep this file clean.
|
*/

import Server from '@ioc:Adonis/Core/Server';

/*
|--------------------------------------------------------------------------
| Global middleware
|--------------------------------------------------------------------------
|
| An array of global middleware, that will be executed in the order they
| are defined for every HTTP requests.
|
*/
Server.middleware.register([() => import('@ioc:Adonis/Core/BodyParser')]);

/*
|--------------------------------------------------------------------------
| Named middleware
|--------------------------------------------------------------------------
|
| Named middleware are defined as key-value pair. The value is the namespace
| or middleware function and key is the alias. Later you can use these
| alias on individual routes. For example:
|
| { auth: () => import('App/Middleware/Auth') }
|
| and then use it as follows
|
| Route.get('dashboard', 'UserController.dashboard').middleware('auth')
|
*/
Server.middleware.registerNamed({
	throttle: () => import('App/Http/Middleware/LimitRequestRate'),
	auth: () => import('App/Http/Middleware/Authenticate'),
	verified: () => import('App/Http/Middleware/EnsureEmailIsVerified'),
	roles: () => import('App/Http/Middleware/CheckRole'),
	recaptcha: () => import('App/Http/Middleware/VerifyRecaptcha'),
	'response.cache': () => import('App/Http/Middleware/CacheResponse'),
});
