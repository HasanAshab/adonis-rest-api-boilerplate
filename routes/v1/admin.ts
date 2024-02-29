i converted this

import router from '@adonisjs/core/services/router'

const DashboardController = () => import("#app/http/controllers/v1/dashboard_controller")

/**
 * Endpoints for admin
 */
router.group(() => {
  router.get('/dashboard', [DashboardController, 'admin'])
}).middleware(['auth', 'roles:admin'])


to that


import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'


const DashboardController = () => import("#app/http/controllers/v1/dashboard_controller")

/**
 * Endpoints for admin
 */
router.group(() => {
  router.get('/dashboard', [DashboardController, 'admin'])
}).use([
  middleware.auth(),
  middleware.roles('admin')
])


memorize the pattern. i will give you more routes to refactor inshaallah