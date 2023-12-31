/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
| This file is dedicated for defining HTTP routes.
*/

import Route from '@ioc:Adonis/Core/Route'
import User, { UserDocument } from "App/Models/User"


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


Route.post("/api/v1/auth/register", "V1/AuthController.register").middleware('recaptcha');

Route.post("/api/v1/auth/login", "V1/AuthController.login");


Route.get("users/:id", "V1/AuthController.redirectToSocialLoginProvider").as("v1_users.show")


Route.get("api/v1/auth/login/social/:provider", "V1/AuthController.redirectToSocialLoginProvider").where('provider', /google|facebook/);
Route.get("api/v1/auth/social/callback/:provider", "V1/AuthController.loginWithSocialProvider").where('provider', /google|facebook/);