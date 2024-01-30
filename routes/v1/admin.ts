import Route from '@ioc:Adonis/Core/Route';
//import DashboardController from "~/app/http/controllers/v1/DashboardController";
// import CategoryController from "~/app/http/controllers/v1/CategoryController";


Route.group(() => {
  Route.get("/dashboard", "DashboardController.admin");
  //Route.apiResource("categories", CategoryController);
})
.middleware(["auth", "roles:admin"]);
