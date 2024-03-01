import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'


// Routes for V1
router.group(() => {
  router.discover('routes/v1')
})
.use(middleware.throttle('low'))
.prefix('/api/v1/')
.as('v1')
