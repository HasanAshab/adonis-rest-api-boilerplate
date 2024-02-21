import Route from '@ioc:Adonis/Core/Route'

/**
 * Endpoints to authenticate users
 */

Route.post('/register', 'AuthController.register').middleware('recaptcha')

// Login through various methods
Route.group(() => {
  Route.post('/', 'AuthController.login').middleware(['throttle:global', 'recaptcha'])

  // login with external providers
  Route.post('/social/:provider', 'AuthController.loginWithSocialAuthToken').where(
    'provider',
    /^(google|facebook)$/
  )
}).prefix('login')

Route.post('/logout', 'AuthController.logout').middleware('auth')

// Two factor authentication
Route.group(() => {
  Route.post('/recover', 'AuthController.recoverTwoFactorAccount').middleware('recaptcha')
  Route.post('/challenges', 'AuthController.twoFactorChallenge').middleware('throttle:60000,3')
  Route.post('/verification', 'AuthController.verifyTwoFactorChallenge').middleware('throttle:60000,3')
}).prefix('two-factor')

// Password Reset
Route.group(() => {
  Route.post('/forgot', 'AuthController.forgotPassword')
  .middleware([
    'recaptcha',
    'throttle:10000,2',
  ])
  Route.patch('/reset', 'AuthController.resetPassword')
}).prefix('password')

// Verify user
Route.group(() => {
  Route.post('/', 'AuthController.verifyEmail')
  Route.post('/notification', 'AuthController.resendEmailVerification').middleware('throttle:60000,1')
}).prefix('verification')
