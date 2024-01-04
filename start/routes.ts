/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
| This file is dedicated for defining HTTP routes.
*/

import Route from '@ioc:Adonis/Core/Route';
import User, { UserDocument } from 'App/Models/User';

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

await Router.controller(AuthController).group(async () => {
	// Login with various methods
	await Router.prefix('/login').group(async () => {
		Router.post('/', 'login')//.middleware('throttle:1,1', 'recaptcha');
		Router.post('/recovery-code', 'loginWithRecoveryCode').middleware(
			'throttle:2,1',
			'recaptcha',
		);

		// Social login provided by Google, Facebook OAuth
		await Router.prefix('/social/:provider(google|facebook)').group(() => {
			Router.get('/', 'redirectToSocialLoginProvider');
			Router.post('/final-step', 'socialLoginFinalStep');
		});
	});

	// User password management
	await Router.prefix('/password').group(() => {
		Router.post('/forgot', 'forgotPassword').middleware(
			'recaptcha',
			'throttle:10000,2',
		);
		Router.patch('/reset', 'resetPassword');
		Router.patch('/change', 'changePassword').middleware('auth', 'verified');
	});

	// Verify user
	await Router.prefix('/verify').group(() => {
		Router.get('/:id/:token', 'verifyEmail').name('verify');
		Router.post('/resend', 'resendEmailVerification').middleware('throttle:60000,1');
	});

	Router.post('/register', 'register').middleware('recaptcha');
	Router.get(
		'social/callback/:provider(google|facebook)',
		'loginWithSocialProvider',
	);
	Router.post('/send-otp/:user', 'sendOtp').middleware('throttle:60000,3');
	Router.patch('/change-phone-number', 'changePhoneNumber').middleware(
		'auth',
		'verified',
	);
	Router.post('/generate-recovery-codes', 'generateRecoveryCodes').middleware(
		'throttle:60000,3',
		'auth',
		'verified',
	);
});
