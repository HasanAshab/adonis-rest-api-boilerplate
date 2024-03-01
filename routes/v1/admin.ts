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