import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { criticalThrottle, highThrottle } from '#start/limiter'

const AuthController = () => import('#controllers/v1/auth_controller')

/**
 * Endpoints to authenticate users
 */
export default function authRoutes() {
  router.post('/register', [AuthController, 'register']).use(middleware.recaptcha())

  // Login through various methods
  router
    .group(() => {
      router.post('/', [AuthController, 'login']).use([highThrottle, middleware.recaptcha()])

      // login with external providers
      router
        .post('/social/:provider', [AuthController, 'loginWithSocialAuthToken'])
        .where('provider', /^(google|facebook)$/)
    })
    .prefix('login')

  router.group(() => {
    router.post('/', [AuthController, 'logout'])
    router.post('device/:id', [AuthController, 'logoutOnDevice']).as('v1.logout.device')
  })
  .prefix('logout')
  .use(middleware.auth())
  
  // Two factor authentication
  router
    .group(() => {
      router
        .post('/recover', [AuthController, 'recoverTwoFactorAccount'])
        .use(middleware.recaptcha())
      router
        .post('/challenges', [AuthController, 'sendTwoFactorChallenge'])
        .use([criticalThrottle, middleware.recaptcha()])
      router
        .post('/challenges/verification', [AuthController, 'verifyTwoFactorChallenge'])
        .use(highThrottle)
    })
    .prefix('two-factor')

  // Password Reset
  router
    .group(() => {
      router
        .post('/forgot', [AuthController, 'forgotPassword'])
        .use([middleware.recaptcha(), criticalThrottle])
      router.patch('/reset', [AuthController, 'resetPassword'])
    })
    .prefix('password')

  // Verify user
  router
    .group(() => {
      router.post('/', [AuthController, 'verifyEmail'])
      router
        .post('/notification', [AuthController, 'resendEmailVerification'])
        .use(criticalThrottle)
    })
    .prefix('verification')
}
