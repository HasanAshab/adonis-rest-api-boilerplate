import router from '@adonisjs/core/services/router'
// import DashboardController from "~/app/http/controllers/v1/DashboardController";
// import CategoryController from "~/app/http/controllers/v1/CategoryController";

router.group(() => {
  router.get('/dashboard', 'DashboardController.admin')
  // Route.apiResource("categories", CategoryController);
}).middleware(['auth', 'roles:admin'])
