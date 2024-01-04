// import Router from "~/core/http/routing";
// import ContactController from "~/app/http/controllers/v1/ContactController";
//
//Endpoints for contact
//
// await Router.controller(ContactController).group(async () => {
//   Router.post("/", "store");
//
//   await Router.group({
//     prefix: "/inquiries",
//     middlewares: ["auth", "roles:admin"]
//   }, () => {
//     Router.get("/", "index");
//     Router.get("/suggest", "suggest");
//     Router.get("/search", "search");
//     Router.get("/:rawContact", "show");
//     Router.delete("/:id", "delete");
//     Router.patch("/:id/status", "updateStatus");
//   });
// });
