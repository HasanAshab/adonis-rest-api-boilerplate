import Route from '@ioc:Adonis/Core/Route';

/**
 * Endpoints to authenticate users
 */
 
Route.post('/register', 'AuthController.register').middleware('recaptcha');

// Route.get("social/callback/:provider(google|facebook)", "loginWithSocialProvider");

// Login through various methods
Route.group(() => {
	Route.post('/', 'AuthController.login').middleware(['throttle:global', 'recaptcha']);

	// login with external providers
	/* Route.group(() => {
      Route.get("/", "redirectToSocialLoginProvider");
      Route.post("/final-step", "socialLoginFinalStep");
    }).prefix("/social/:provider(google|facebook)");
    */
}).prefix('/login');

Route.post('/logout', 'AuthController.logout').middleware('auth');

// Two factor authentication
Route.group(() => {
  Route.post("/recover", "AuthController.recoverAccount").middleware("recaptcha");
  Route.post("/send-otp/:id", "AuthController.sendOtp").middleware("throttle:60000,3");
  
  Route.group(() => {
    Route.post("/setup", "AuthController.setupTwoFactorAuth");
    Route.post("/generate-recovery-codes", "AuthController.generateRecoveryCodes").middleware("recaptcha");
  }).middleware('auth', 'verified');
  
}).prefix('/two-factor');


// Password Reset
Route.group(() => {
	Route.post('/forgot', 'AuthController.forgotPassword').middleware(['recaptcha', 'throttle:10000,2']);
	Route.patch('/reset/:id', 'AuthController.resetPassword');
}).prefix('/password');


// Verify user
Route.group(() => {
  Route.get("/:id", "verifyEmail").as("verify").middleware('signed');
  Route.post("/resend", "resendEmailVerification").middleware("throttle:60000,1");
}).prefix("/verify");
