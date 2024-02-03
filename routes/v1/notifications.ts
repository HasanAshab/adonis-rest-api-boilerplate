// import Router from "~/core/http/routing";
// import NotificationController from "~/app/http/controllers/v1/NotificationController";
//
// Endpoints for notification
//
// await Router.group({
//   controller: NotificationController,
//   middlewares: ["auth", "verified"],
//   as: "notification."
// }, () => {
//   Router.get("/", "index");
//   Router.get("/:rawNotification", "show");
//   Router.get("/unread-count", "unreadCount");
//   Router.patch("/read/all", "markAsRead").name("markAsRead");
//   Router.patch("/:id/read", "markAsRead").name("markAsRead");
//   Router.delete("/:id", "delete").name("delete");
// });
