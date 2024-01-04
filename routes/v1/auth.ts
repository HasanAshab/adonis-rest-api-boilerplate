import Route from '@ioc:Adonis/Core/Route';

/**
 * Endpoints to authenticate users
 */

Route.post('/register', 'AuthController.register').middleware('recaptcha');
// Route.get("social/callback/:provider(google|facebook)", "loginWithSocialProvider");
//   Route.post("/send-otp/:user", "sendOtp").middleware("throttle:60000,3");
//   Route.patch("/change-phone-number", "changePhoneNumber").middleware("auth", "verified");
//   Route.post("/generate-recovery-codes", "generateRecoveryCodes").middleware("throttle:60000,3", "auth", "verified");

// Login with various methods
Route.group(() => {
	Route.post('/', 'AuthController.login').middleware('throttle:global', 'recaptcha');
	//Route.post("/recovery-code", "loginWithRecoveryCode").middleware("throttle:2000,1", "recaptcha");

	// Social login provided by Google, Facebook OAuth
	/* Route.group(() => {
      Route.get("/", "redirectToSocialLoginProvider");
      Route.post("/final-step", "socialLoginFinalStep");
    }).prefix("/social/:provider(google|facebook)");
    */
}).prefix('/login');

// User password management
Route.group(() => {
	Route.post('/forgot', 'AuthController.forgotPassword').middleware(
		'recaptcha',
		'throttle:10000,2',
	);
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
