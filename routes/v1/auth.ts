import router from '@adonisjs/core/services/router'

/**
 * Endpoints to authenticate users
 */

router.post('/register', 'AuthController.register').middleware('recaptcha')

// Login through various methods
router.group(() => {
  router.post('/', 'AuthController.login').middleware(['throttle:global', 'recaptcha'])

  // login with external providers
  router.post('/social/:provider', 'AuthController.loginWithSocialAuthToken').where(
    'provider',
    /^(google|facebook)$/
  )
}).prefix('login')

router.post('/logout', 'AuthController.logout').middleware('auth')

// Two factor authentication
router.group(() => {
  router.post('/recover', 'AuthController.recoverTwoFactorAccount').middleware('recaptcha')
  router.post('/challenges', 'AuthController.sendTwoFactorChallenge').middleware('recaptcha')
  router.post('/challenges/verification', 'AuthController.verifyTwoFactorChallenge').middleware('throttle:60000,3')
}).prefix('two-factor')


// Password Reset
router.group(() => {
  router.post('/forgot', 'AuthController.forgotPassword')
  .middleware([
    'recaptcha',
    'throttle:10000,2',
  ])
  router.patch('/reset', 'AuthController.resetPassword')
}).prefix('password')

// Verify user
router.group(() => {
  router.post('/', 'AuthController.verifyEmail')
  router.post('/notification', 'AuthController.resendEmailVerification').middleware('throttle:60000,1')
}).prefix('verification')
