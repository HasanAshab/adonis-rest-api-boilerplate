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

  /*
 Route.get("social/callback/:provider", "AuthController.loginWithSocialProvider");
  Route.group(() => {
    Route.get("/", "AuthController.redirectToSocialLoginProvider");
    Route.post("/final-step", "AuthController.socialLoginFinalStep");
  }).prefix("/social/:provider");
  */
}).prefix('/login')

Route.post('/logout', 'AuthController.logout').middleware('auth')

// Two factor authentication
Route.group(() => {
  Route.post('/recover', 'AuthController.recoverAccount').middleware('recaptcha')
  Route.post('/send-otp/:id', 'AuthController.sendOtp').middleware('throttle:60000,3')

  Route.group(() => {
    Route.post('/setup', 'AuthController.setupTwoFactorAuth')
    Route.post('/generate-recovery-codes', 'AuthController.generateRecoveryCodes').middleware(
      'recaptcha'
    )
  }).middleware('auth', 'verified')
}).prefix('/two-factor')

// Password Reset
Route.group(() => {
  Route.post('/forgot', 'AuthController.forgotPassword').middleware([
    'recaptcha',
    'throttle:10000,2',
  ])
  Route.patch('/reset/:id', 'AuthController.resetPassword')
}).prefix('/password')

// Verify user
Route.group(() => {
  Route.post('/:id/:token', 'AuthController.verifyEmail')
  Route.post('/resend', 'AuthController.resendEmailVerification').middleware('throttle:60000,1')
}).prefix('/verify')
