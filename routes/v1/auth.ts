import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'


// Import the AuthController dynamically
const AuthController = () => import("#app/http/controllers/v1/auth_controller")


/**
 * Endpoints to authenticate users
 */

router.post('/register', [AuthController, 'register']).use(middleware.recaptcha())

// Login through various methods
router.group(() => {
  router.post('/', [AuthController, 'login']).use([
    middleware.throttle('high'),
    middleware.recaptcha()
  ])

  // login with external providers
  router.post('/social/:provider', [AuthController, 'loginWithSocialAuthToken']).where(
    'provider',
    /^(google|facebook)$/
  )
}).prefix('login')

router.post('/logout', [AuthController, 'logout']).use(middleware.auth())

// Two factor authentication
router.group(() => {
  router.post('/recover', [AuthController, 'recoverTwoFactorAccount']).use(middleware.recaptcha())
  router.post('/challenges', [AuthController, 'sendTwoFactorChallenge']).use([
    middleware.throttle('critical')
    middleware.recaptcha()
  ])
  router.post('/challenges/verification', [AuthController, 'verifyTwoFactorChallenge']).use(middleware.throttle('high'))
}).prefix('two-factor')

// Password Reset
router.group(() => {
  router.post('/forgot', [AuthController, 'forgotPassword'])
  .use([
    middleware.recaptcha(),
    middleware.throttle('critical')
  ])
  router.patch('/reset', [AuthController, 'resetPassword'])
}).prefix('password')

// Verify user
router.group(() => {
  router.post('/', [AuthController, 'verifyEmail'])
  router.post('/notification', [AuthController, 'resendEmailVerification']).use(middleware.throttle('critical'))
}).prefix('verification')
