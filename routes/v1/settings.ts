// import Router from "~/core/http/routing";
// import SettingsController from "~/app/http/controllers/v1/SettingsController";
// 
// 
// await Router.controller(SettingsController).group(async () => {
//   // User settings managenent
//   await Router.middleware(["auth", "verified"]).group(() => {
//     Router.get("/", "index");
//     Router.post("/setup-2fa", "setupTwoFactorAuth");
//     Router.patch("/notification", "setupNotificationPreference");
//   });
// 
//   // App settings managenent
//   await Router.middleware(["auth", "roles:admin"]).group(() => {
//     Router.get("/app", "getAppSettings");
//     Router.patch("/app", "updateAppSettings");
//   });
// });