import Route from '@ioc:Adonis/Core/Route';

//Endpoints for user management

Route.group(() => {
  Route.get("/", "UserController.index");
  Route.patch("/:username/make-admin", "UserController.makeAdmin");
})
.middleware("auth", "roles:admin");


Route.group(() => {
  Route.group(() => {
    Route.get("/", "UserController.profile");
    Route.patch("/", "UserController.updateProfile");
    
    Route.group(() => {
      Route.patch("/password", "UserController.changePassword");
      Route.patch("/phone-number", "UserController.changePhoneNumber");
    }).prefix('change');
    
  }).prefix('me');
  
  Route.get("/:username", "UserController.show").as("users.show");
  Route.delete("/:username", "UserController.delete");
})
.middleware("auth", "verified");