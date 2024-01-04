// import Router from "~/core/http/routing";
// import UserController from "~/app/http/controllers/v1/UserController";
//
//Endpoints for user management
//
// await Router.controller(UserController).group(async () => {
//   //Router.middleware(["auth", "verified"]).group(() => {
//   await Router.middleware([]).group(() => {
//     Router.get("/me", "profile");
//     Router.patch("/me", "updateProfile");
//     Router.get("/:username", "show").name("users.show");
//     Router.delete("/:username", "delete");
//   });
//
//  // Router.middleware(["auth", "roles:admin"]).group(() => {
//   await Router.middleware([]).group(() => {
//     Router.get("/", "index");
//     Router.patch("/:username/make-admin", "makeAdmin");
//   });
// });
