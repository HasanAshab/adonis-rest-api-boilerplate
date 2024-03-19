import router from '@adonisjs/core/services/router'
import { lowThrottle } from '#start/limiter'

// Routes for V1
await router.discover('routes/v1', (group) => {
  group.use(lowThrottle).prefix('/api/v1/').as('v1')
})
