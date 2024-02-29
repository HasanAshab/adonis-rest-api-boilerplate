import router from '@adonisjs/core/services/router'
const DashboardController = () => import("#app/http/controllers/v1/dashboard_controller")

/**
 * Endpoints for admin
 */
router.group(() => {
  router.get('/dashboard', [DashboardController, 'admin'])
}).middleware(['auth', 'roles:admin'])