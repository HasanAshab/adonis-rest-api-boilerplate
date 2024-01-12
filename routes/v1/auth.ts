import Route from '@ioc:Adonis/Core/Route';

/**
 * Endpoints to authenticate users
 */

Route.post('/register', 'AuthController.register').middleware('recaptcha');
// Route.get("social/callback/:provider(google|facebook)", "loginWithSocialProvider");
//   Route.patch("/change-phone-number", "changePhoneNumber").middleware("auth", "verified");



Route.group(() => {
  Route.post("/recover", "AuthController.recoverAccount").middleware("recaptcha");
  Route.post("/send-otp/:user", "AuthController.sendOtp").middleware("throttle:60000,3");
  
  Route.group(() => {
    Route.post("/setup", "AuthController.setupTwoFactorAuth");
    Route.post("/generate-recovery-codes", "AuthController.generateRecoveryCodes").middleware("recaptcha");
  }).middleware('auth', 'verified');
  
}).prefix('/two-factor');


// Login with various methods
Route.group(() => {
	Route.post('/', 'AuthController.login').middleware(['throttle:global', 'recaptcha']);

	// login with external providers
	/* Route.group(() => {
      Route.get("/", "redirectToSocialLoginProvider");
      Route.post("/final-step", "socialLoginFinalStep");
    }).prefix("/social/:provider(google|facebook)");
    */
}).prefix('/login');

// User password management
Route.group(() => {
	Route.post('/forgot', 'AuthController.forgotPassword').middleware(['recaptcha', 'throttle:10000,2']);
	Route.patch('/reset', 'AuthController.resetPassword');
	//Route.patch("/change", "AuthController.changePassword").middleware("auth", "verified");
}).prefix('/password');

// Verify user
/*
  Route.prefix("/verify").group(() => {
    Route.get("/:id/:token", "verifyEmail").name("verify");
    Route.post("/resend", "resendEmailVerification").middleware("throttle:60000,1");
  });
  */
