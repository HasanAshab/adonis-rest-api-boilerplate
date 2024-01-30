import Route from '@ioc:Adonis/Core/Route';
//import DashboardController from "~/app/http/controllers/v1/DashboardController";
// import CategoryController from "~/app/http/controllers/v1/CategoryController";


Router.group(() => {
  Router.get("/dashboard", "DashboardController.admin");
  //Router.apiResource("categories", CategoryController);
})
.middleware(["auth", "roles:admin"]);
