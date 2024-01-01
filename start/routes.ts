/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
| This file is dedicated for defining HTTP routes.
*/

import Route from '@ioc:Adonis/Core/Route'
import User, { UserDocument } from "App/Models/User"

/*
Route.post('/', async ({ request }) => {
  //await User.factory().count(10).create();
  
//  return await User.deleteOne().latest();
  let user = await User.findOne().latest();

   const profile = request.file("profile");
  if(profile) {
    user.profile = profile;
  }
  
  console.log(user)

  await user.save();
  
  //await user.delete();

  return user;
})
*/

/**
 * Endpoints to authenticate users
*/
Route.group(() => {
  Route.post("/register", "AuthController.register").middleware("recaptcha");
  // Route.get("social/callback/:provider(google|facebook)", "loginWithSocialProvider");
//   Route.post("/send-otp/:user", "sendOtp").middleware("throttle:60000,3");
//   Route.patch("/change-phone-number", "changePhoneNumber").middleware("auth", "verified");
//   Route.post("/generate-recovery-codes", "generateRecoveryCodes").middleware("throttle:60000,3", "auth", "verified");


  // Login with various methods
  Route.group(() => {
    Route.post("/", "AuthController.login").middleware("throttle:2000,2", "recaptcha");
    //Route.post("/recovery-code", "loginWithRecoveryCode").middleware("throttle:2000,1", "recaptcha");
    
    // Social login provided by Google, Facebook OAuth
   /* Route.group(() => {
      Route.get("/", "redirectToSocialLoginProvider");
      Route.post("/final-step", "socialLoginFinalStep");
    }).prefix("/social/:provider(google|facebook)");
    */
    
  }).prefix("/login");
  
  
  // User password management
  Route.group(() => {
    Route.post("/forgot", "AuthController.forgotPassword").middleware("recaptcha", "throttle:10000,2");
    //Route.patch("/reset", "AuthController.resetPassword");
    //Route.patch("/change", "AuthController.changePassword").middleware("auth", "verified");
  }).prefix("/password");

  // Verify user
  /*
  Route.prefix("/verify").group(() => {
    Route.get("/:id/:token", "verifyEmail").name("verify");
    Route.post("/resend", "resendEmailVerification").middleware("throttle:60000,1");
  });
  */
  
})
.namespace('App/Http/Controllers/V1')
.prefix('/api/v1/auth');
