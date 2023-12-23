/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
| This file is dedicated for defining HTTP routes.
*/

import Route from '@ioc:Adonis/Core/Route'


Route.post("auth", "V1/AuthController.register");


Route.get("users/:id", "V1/AuthController.redirectToSocialLoginProvider").as("v1_users.show")


Route.get("auth/:provider", "V1/AuthController.redirectToSocialLoginProvider").where('provider', /google|facebook/);
Route.get("api/v1/auth/social/callback/:provider", "V1/AuthController.loginWithSocialProvider").where('provider', /google|facebook/);