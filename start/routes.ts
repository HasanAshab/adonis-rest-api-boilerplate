import router from '@adonisjs/core/services/router'


// Routes for V1
router.group(() => {
  router.discover('routes/v1')
})
.prefix('/api/v1/')
.as('v1')